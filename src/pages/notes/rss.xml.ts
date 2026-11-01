import type { APIRoute } from 'astro';
import { contactEmail, site as siteConfig } from '../../config/site';
import { getNotes } from '../../lib/content';
import { absoluteUrl } from '../../lib/paths';

/**
 * The Notes RSS feed, written by hand rather than pulled in as a dependency: it
 * is a dozen lines of well-defined XML, and the one thing that can go wrong
 * (unescaped `&`, `<` or `>` in a title or summary) is handled in one place
 * below. Like `robots.txt`, it is an endpoint so every URL derives from
 * `Astro.site` and the configured base instead of a hardcoded origin.
 *
 * The feed reads `getNotes()`, the same published, draft-filtered list as
 * `/notes`, so a note is in the feed exactly when it is on the site. `pubDate`
 * is the note's date as RFC-822 (`toUTCString()`), which is what RSS wants.
 */
const FEED_TITLE = `Notes by ${siteConfig.name}`;
const FEED_DESCRIPTION =
  'Occasional writing on what I’m building and figuring out, plus a record of talks.';
/** RSS wants `email (Name)` for the editorial and technical contacts. */
const FEED_AUTHOR = `${contactEmail} (${siteConfig.name})`;

/** Escape the five XML-significant characters. Applied to every dynamic value. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const notes = await getNotes();

  const feedUrl = absoluteUrl('/notes/rss.xml', site);
  const pageUrl = absoluteUrl('/notes', site);

  const items = notes
    .map((entry) => {
      const link = absoluteUrl(`/notes/${entry.id}`, site);
      return [
        '    <item>',
        `      <title>${escapeXml(entry.data.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${entry.data.date.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(entry.data.summary)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(pageUrl)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${siteConfig.lang}</language>
    <managingEditor>${escapeXml(FEED_AUTHOR)}</managingEditor>
    <webMaster>${escapeXml(FEED_AUTHOR)}</webMaster>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
