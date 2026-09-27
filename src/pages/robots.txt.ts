import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/paths';

/**
 * robots.txt as an endpoint rather than a static file in `public/`, so the
 * Sitemap line is derived from `Astro.site` (SITE_URL) and the configured base
 * instead of hardcoding an origin. Switching to a custom domain or to a project
 * repo therefore needs no edit here.
 *
 * Note: crawlers only honour robots.txt at the origin root. When BASE_PATH is a
 * sub-path (a project repo), this file is published at `<base>/robots.txt` and
 * is advisory only: the sitemap is still discoverable via the <link> tag in
 * <head>.
 */
export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl('/sitemap-index.xml', site)}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
