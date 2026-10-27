import fallback from '../../../public/data/latest.json';
import {readPublication} from '../../../lib/publication.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export async function GET() {
  return Response.json(await readPublication(fallback), {headers: {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  }});
}
