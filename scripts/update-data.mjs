import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {buildForecast, bangkokDay} from '../lib/forecast-engine.mjs';
import {validateSnapshot} from '../lib/snapshot-validation.mjs';

export async function updateData(directory, build = buildForecast) {
  await mkdir(directory, {recursive: true});
  const latest = new URL('latest.json', directory), statusFile = new URL('status.json', directory);
  const startedAt = new Date().toISOString();
  try {
    const snapshot = validateSnapshot(await build());
    const status = {state: 'succeeded', issueDate: snapshot.issueDate, startedAt, completedAt: new Date().toISOString(), retainedPrevious: false};
    const temporary = new URL('latest.tmp', directory);
    await writeFile(temporary, JSON.stringify(snapshot));
    await rename(temporary, latest);
    await writeFile(statusFile, JSON.stringify(status, null, 2) + '\n');
    console.log(JSON.stringify({state: status.state, issueDate: snapshot.issueDate, observations: snapshot.observationRange, cells: snapshot.cells.length, days: snapshot.days.length, rivers: snapshot.rivers.status}));
    return status;
  } catch (error) {
    let previous = null;
    try {previous = JSON.parse(await readFile(latest, 'utf8'));} catch {}
    await writeFile(statusFile, JSON.stringify({state: 'failed', attemptedIssueDate: bangkokDay(), startedAt, completedAt: new Date().toISOString(), retainedPrevious: !!previous, issueDate: previous?.issueDate ?? null, error: String(error.message).slice(0, 300)}, null, 2) + '\n');
    throw error;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {await updateData(new URL('../public/data/', import.meta.url));}
  catch (error) {console.error('Update failed; previous successful snapshot retained:', error.message); process.exitCode = 1;}
}
