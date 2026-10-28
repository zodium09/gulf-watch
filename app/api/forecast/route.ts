import fallback from '../../../public/data/latest.json';
import localStatus from '../../../public/data/status.json';
import {readPublication,publication} from '../../../lib/publication.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export async function GET() {
  // Local development previews the dataset produced by update:data in this checkout.
  // Production continues to consume the independently refreshed public feed.
  const data = process.env.NODE_ENV === 'development'
    ? publication(fallback,localStatus,new Date(),'local_preview')
    : await readPublication(fallback);
  return Response.json(data, {headers: {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  }});
}
