/**
 * The only way pages should reach content.
 *
 * Two rules are enforced here so no page has to remember them:
 *
 * - **Drafts.** `draft: true` entries stay visible while authoring (`astro dev`)
 *   and disappear from the built site. Write in the open, publish on purpose.
 * - **Order.** Every comparator below is total: it ends on the entry `id`, so
 *   two entries are never "equal" and the rendered order cannot drift between
 *   builds. Missing `order` / `year` / `date` values sort last instead of
 *   throwing or producing `NaN`.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type BuildEntry = CollectionEntry<'builds'>;
export type SideQuestEntry = CollectionEntry<'sideQuests'>;
export type WorkEntry = CollectionEntry<'work'>;

/** The shape every comparator and filter below actually needs. */
type SortableEntry = { id: string };
type DraftableEntry = { data: { draft?: boolean } };

/**
 * True when an entry should be rendered. Drafts survive `astro dev` and are
 * dropped from `astro build`, so unfinished writing is never published by
 * accident but is always previewable.
 */
export function isPublished(entry: DraftableEntry): boolean {
  if (!import.meta.env.PROD) return true;
  return entry.data.draft !== true;
}

/** Ascending, with absent values pushed to the end. */
function byNumberAsc(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a - b;
}

/** Descending, with absent values pushed to the end. */
function byNumberDesc(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return b - a;
}

/** Milliseconds for a date, or `undefined` for a missing or unparseable one. */
function timestamp(date: Date | undefined): number | undefined {
  if (!(date instanceof Date)) return undefined;
  const value = date.getTime();
  return Number.isNaN(value) ? undefined : value;
}

/** Newest first, with undated entries pushed to the end. */
function byDateDesc(a: Date | undefined, b: Date | undefined): number {
  return byNumberDesc(timestamp(a), timestamp(b));
}

/** Locale-aware alphabetical comparison, stable for equal strings. */
function byText(a: string | undefined, b: string | undefined): number {
  return (a ?? '').localeCompare(b ?? '', 'en');
}

/** `true` before `false`. */
function byFlagFirst(a: boolean | undefined, b: boolean | undefined): number {
  return Number(b === true) - Number(a === true);
}

/** Final tiebreaker. Guarantees a total, reproducible order. */
function byId(a: SortableEntry, b: SortableEntry): number {
  return a.id.localeCompare(b.id, 'en');
}

/**
 * Published builds: curated `order` first, then most recent year, then title.
 */
export async function getBuilds(): Promise<BuildEntry[]> {
  const builds = await getCollection('builds', isPublished);
  return builds.sort(
    (a, b) =>
      byNumberAsc(a.data.order, b.data.order) ||
      byNumberDesc(a.data.year, b.data.year) ||
      byText(a.data.title, b.data.title) ||
      byId(a, b),
  );
}

/**
 * Builds for the homepage's Selected Builds table: `featured: true` first, then
 * the normal build order. Deliberately not a filter — if nothing is featured
 * yet, the section still renders the most relevant builds instead of an empty
 * state. Pass `limit` to cap the list.
 */
export async function getFeaturedBuilds(limit?: number): Promise<BuildEntry[]> {
  const builds = await getBuilds();
  const featuredFirst = builds.sort((a, b) => byFlagFirst(a.data.featured, b.data.featured));
  return typeof limit === 'number' ? featuredFirst.slice(0, Math.max(0, limit)) : featuredFirst;
}

/**
 * Published side quests: curated `order` first, then most recent year, then
 * title.
 */
export async function getSideQuests(): Promise<SideQuestEntry[]> {
  const sideQuests = await getCollection('sideQuests', isPublished);
  return sideQuests.sort(
    (a, b) =>
      byNumberAsc(a.data.order, b.data.order) ||
      byNumberDesc(a.data.year, b.data.year) ||
      byText(a.data.title, b.data.title) ||
      byId(a, b),
  );
}

/**
 * Published roles: the current one first, then curated `order`, then most
 * recent start (falling back to end date), then company name. `period` is a
 * free-form string and is never parsed, so `order` is the reliable knob.
 */
export async function getWorkEntries(): Promise<WorkEntry[]> {
  const roles = await getCollection('work', isPublished);
  return roles.sort(
    (a, b) =>
      byFlagFirst(a.data.current, b.data.current) ||
      byNumberAsc(a.data.order, b.data.order) ||
      byDateDesc(a.data.start ?? a.data.end, b.data.start ?? b.data.end) ||
      byText(a.data.company, b.data.company) ||
      byId(a, b),
  );
}

/**
 * UTC so a date authored as `2026-03-12` never renders as the 11th for a
 * reader west of Greenwich.
 */
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `12 Mar 2026`. Returns an em dash rather than `Invalid Date`. */
export function formatDate(date: Date): string {
  const value = timestamp(date);
  if (value === undefined) return '—';
  return dateFormatter.format(value);
}

/**
 * First usable candidate, else the given fallback. Keeps every page's
 * description distinct instead of silently inheriting the site-wide one.
 *
 * Placeholder text (`TODO: ...`) is correct on the page — it tells the owner
 * what to write — but must never become a meta description or social-card
 * summary, where it would read as the page's actual summary.
 */
export function pageDescription(candidates: Array<string | undefined>, fallback: string): string {
  for (const candidate of candidates) {
    if (candidate === undefined) continue;
    const trimmed = candidate.trim();
    if (trimmed === '' || trimmed.toUpperCase().startsWith('TODO')) continue;
    return trimmed;
  }
  return fallback;
}

/** `2026`, or an em dash when the year is unknown. */
export function formatYear(year?: number): string {
  if (year === undefined || !Number.isFinite(year)) return '—';
  return String(year);
}
