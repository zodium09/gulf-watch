import {bangkokDay} from './forecast-engine.mjs';

// Public, versioned data; only the repository's workflow can write it.
export const DATA_BASE = 'https://raw.githubusercontent.com/zodium09/gulf-watch/main/public/data/';
export function publication(snapshot, status, now = new Date(), source = 'github') {
  return {
    ...snapshot,
    isStale: snapshot.issueDate !== bangkokDay(now),
    publicationStatus: status ?? {state: 'unknown'},
    publicationSource: source,
    schedule: {timezone: 'Asia/Bangkok', time: '07:15', provider: 'GitHub Actions', timing: 'best_effort'},
  };
}

export async function readPublication(fallback, fetcher = fetch) {
  try {
    const read = async file => {
      const response = await fetcher(DATA_BASE + file, {cache: 'no-store', signal: AbortSignal.timeout(12000)});
      if (!response.ok) throw Error(`Data source HTTP ${response.status}`);
      return response.json();
    };
    const [snapshot, status] = await Promise.all([read('latest.json'), read('status.json')]);
    if (snapshot.schema !== 3 || snapshot.days?.length !== 6 || !snapshot.cells?.length || !snapshot.issueDate) throw Error('Invalid publication');
    if(Date.parse(fallback.generatedAt)>Date.parse(snapshot.generatedAt))return publication(fallback,status,new Date(),'bundled_newer');
    return publication(snapshot, status);
  } catch {
    return publication(fallback, {state: 'failed', retainedPrevious: true, error: 'อ่านข้อมูลล่าสุดไม่ได้ กำลังแสดงชุดข้อมูลสำรอง'}, new Date(), 'bundled_fallback');
  }
}
