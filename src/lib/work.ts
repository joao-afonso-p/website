/**
 * The `/work` timeline's view of the `work` collection.
 *
 * `getWorkEntries()` in `content.ts` handles drafts and returns the current
 * role first, which is the right order for a list. The timeline is a
 * chronology instead, read oldest first, so this re-sorts by `start`. Dates are
 * formatted here rather than typed into frontmatter, so a period can only ever
 * be written once.
 */

import { getWorkEntries, type WorkEntry } from './content';

/** Oldest first. `start` is required by the schema, so there is no undated case. */
export async function getCareer(): Promise<WorkEntry[]> {
  const entries = await getWorkEntries();
  return entries.sort(
    (a, b) => a.data.start.getTime() - b.data.start.getTime() || a.id.localeCompare(b.id, 'en'),
  );
}

/**
 * Three-letter months, spelled out here rather than taken from `Intl`: the
 * `en-GB` short month for September is `Sept`, which breaks the column of
 * three-letter abbreviations the timeline is set in.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `Nov 2022`. UTC, so `2022-11` never renders as October west of Greenwich. */
export function formatMonth(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2022-11`, for `<time datetime>`. */
export function isoMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/** The year a chapter opens on, for the marker on the spine. */
export function startYear(entry: WorkEntry): string {
  return String(entry.data.start.getUTCFullYear());
}

/** `anova.com` from `https://www.anova.com/`, when no label is authored. */
export function hostLabel(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}
