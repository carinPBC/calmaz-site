/**
 * Cloudflare Pages Function — click tracker proxy
 * Forwards to Railway CMS without exposing the backend URL
 */

const CMS = 'https://pbc-cms-production.up.railway.app';
const STATION = 'calmaz';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const dest  = url.searchParams.get('url');
  const type  = url.searchParams.get('type') || 'ad';
  const label = url.searchParams.get('label') || '';
  const page  = url.searchParams.get('page') || '';

  if (!dest) {
    return new Response('Missing url', { status: 400 });
  }

  const trackUrl = CMS + '/api/track/click?station=' + STATION
    + '&type=' + encodeURIComponent(type)
    + '&label=' + encodeURIComponent(label)
    + '&url=' + encodeURIComponent(dest)
    + '&page=' + encodeURIComponent(page);

  // Log click to CMS (fire and forget — don't block redirect)
  context.waitUntil(fetch(trackUrl).catch(function() {}));

  return Response.redirect(dest, 302);
}
