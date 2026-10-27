import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateSnapshot} from '../lib/snapshot-validation.mjs';
import {publication, readPublication} from '../lib/publication.mjs';
import {updateData} from '../scripts/update-data.mjs';
const snapshot = JSON.parse(await readFile(new URL('../public/data/latest.json', import.meta.url), 'utf8'));

test('a failed source preserves the last successful snapshot and records failure', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'gulf-watch-'));
  const directory = pathToFileURL(folder + '/');
  try {
    const original = JSON.stringify(snapshot);
    await writeFile(new URL('latest.json', directory), original);
    await assert.rejects(() => updateData(directory, async () => {throw Error('source outage');}));
    assert.equal(await readFile(new URL('latest.json', directory), 'utf8'), original);
    const status = JSON.parse(await readFile(new URL('status.json', directory), 'utf8'));
    assert.equal(status.state, 'failed');
    assert.equal(status.retainedPrevious, true);
  } finally {await rm(folder, {recursive: true, force: true});}
});

test('public read uses updated GitHub data and reports stale data without redating it', async () => {
  const now = new Date(snapshot.generatedAt);
  assert.equal(publication(snapshot, {state: 'succeeded'}, now).isStale, false);
  assert.equal(publication(snapshot, {}, new Date(+now + 86400000)).isStale, true);
  const data = await readPublication(snapshot, async url => Response.json(url.endsWith('latest.json') ? snapshot : {state: 'succeeded'}));
  assert.equal(data.publicationSource, 'github');
  assert.equal(data.issueDate, snapshot.issueDate);
  const fallback = await readPublication(snapshot, async () => {throw Error('network');});
  assert.equal(fallback.publicationSource, 'bundled_fallback');
  assert.equal(fallback.publicationStatus.state, 'failed');
  assert.equal(fallback.issueDate, snapshot.issueDate);
});

test('validation rejects impossible coordinates and stale observations and recalculates classes', () => {
  const now = new Date(snapshot.generatedAt);
  const invalid = structuredClone(snapshot);
  invalid.cells[0].lat = 80;
  assert.throws(() => validateSnapshot(invalid, now));
  const old = structuredClone(snapshot);
  old.cells[0].spm = 1;
  old.cells[0].spmDate = '2020-01-01';
  assert.throws(() => validateSnapshot(old, now));
  const altered = structuredClone(snapshot);
  altered.days[0].cells[0].turbidity = 5;
  const corrected = validateSnapshot(altered, now);
  const reference = validateSnapshot(structuredClone(snapshot), now);
  assert.deepEqual(corrected.days, reference.days);
});
