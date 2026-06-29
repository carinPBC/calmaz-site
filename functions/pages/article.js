/**
 * Cloudflare Pages Function — injects OG meta tags server-side for social crawlers
 * Avoids fetching origin (causes CF Error 1000 loopback)
 */

const STATION_NAME = 'CalmArizona';
const STATION_ID = 'calmaz';
const SITE_URL = 'https://calmaz.info';
const CMS = 'https://pbc-cms-production.up.railway.app';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const articleId = url.searchParams.get('id');

  // No article ID — serve the static file normally via next()
  if (!articleId) {
    return context.next();
  }

  // Fetch article from CMS
  let title = `Article — ${STATION_NAME}`;
  let description = `News from ${STATION_NAME} — Prescott, Arizona`;
  let image = '';

  try {
    const r = await fetch(`${CMS}/api/news/${articleId}`);
    if (r.ok) {
      const article = await r.json();
      if (article.headline) {
        title = `${article.headline} — ${STATION_NAME}`;
        description = (article.body || '').replace(/<[^>]+>/g, '').substring(0, 200).trim();
        if (article.image) {
          image = article.image.startsWith('http')
            ? article.image
            : `${CMS}/${article.image.replace(/^\//, '')}`;
        }
      }
    }
  } catch(e) {}

  const canonicalUrl = `${SITE_URL}/pages/article.html?id=${articleId}`;
  const esc = s => s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const ogTags = `
  <title>${esc(title)}</title>
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${STATION_NAME}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  ${image ? `<meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ''}`;

  // Serve the static article.html with injected meta — use context.next() to get the file
  const response = await context.next();
  const html = await response.text();

  const injected = html
    .replace(/<title>Article[^<]*<\/title>/, '')
    .replace(/<meta property="og:[^>]+>/g, '')
    .replace(/<meta name="twitter:[^>]+>/g, '')
    .replace(/<meta id="og-[^>]+>/g, '')
    .replace(/<meta id="tw-[^>]+>/g, '')
    .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />${ogTags}`);

  return new Response(injected, {
    status: response.status,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=60',
    }
  });
}
