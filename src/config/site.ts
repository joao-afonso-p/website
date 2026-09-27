/**
 * Site-wide configuration.
 *
 * Deployment origin lives in `astro.config.mjs` (SITE_URL / BASE_PATH) and is
 * read back here from `Astro.site`, so nothing below hardcodes a domain.
 */

export const site = {
  /** Used in <title> templates and structured data. */
  name: 'João Afonso',
  /** Short label for the wordmark in the header. */
  wordmark: 'João Afonso',
  /** Default meta description. */
  description:
    'The résumé is the compressed version. This is a working record of the products, experiments and side quests of an AI engineer who builds things to see if they should exist.',
  /** Default social share text. */
  tagline: 'I build things to see if they should exist.',
  locale: 'en',
  lang: 'en',
  /**
   * Open Graph wants the `language_TERRITORY` form. This is a formatting
   * default, not a claim about where anyone is. Change the territory freely.
   */
  ogLocale: 'en_GB',
  /** Open Graph / Twitter card image, relative to the site base. */
  ogImage: '/og-default.png',
  /** TODO: set once an X/Twitter handle should be advertised. */
  twitterHandle: undefined as string | undefined,
} as const;

/**
 * Primary navigation. Kept deliberately short.
 *
 * `hint` is not used by the header, where the labels have to stay terse. It is
 * there for the homepage, which lists the same destinations with a line of
 * explanation, so a first-time visitor landing on the masthead can see what
 * the site actually contains. One source for both, so a renamed section cannot
 * end up described two different ways.
 */
export const nav = [
  {
    label: 'Builds',
    href: '/builds',
    hint: 'Products I made because I wanted them to exist.',
  },
  {
    label: 'Side Quests',
    href: '/side-quests',
    hint: 'Competitions, teaching, prototypes and one real company.',
  },
  {
    label: 'Work',
    href: '/work',
    hint: 'The work history, with considerably more context.',
  },
] as const;

/** Visually separated from the primary nav: Alfredo is its own thing. */
export const alfredoNav = {
  label: 'Meet Alfredo',
  href: '/alfredo',
  hint: 'A personal operating system. Apparently I needed one.',
} as const;

/**
 * The LinkedIn profile, named rather than inlined because it is published in
 * four places: the header, the footer's "Elsewhere" list and the Alfredo
 * page's two "follow" links. One constant so those cannot drift apart.
 */
export const linkedinUrl = 'https://www.linkedin.com/in/joao-afonso-pereira/';

/**
 * The one outward link in the header. Sits after Alfredo on wide screens and
 * inside the menu on narrow ones. Deliberately not in `nav`: that list is
 * pages of this site, and this is somewhere else. Rendered muted rather than
 * accent, because the accent in that row belongs to Alfredo alone.
 */
export const headerLink = { label: 'LinkedIn', href: linkedinUrl } as const;

/**
 * Footer links. Add entries as they become real. An empty array is simply not
 * rendered rather than shown as a dead link.
 *
 * This list is also the `sameAs` set in the homepage's Person structured data,
 * so it should only ever hold profiles that are actually mine.
 */
export const social: Array<{ label: string; href: string }> = [
  { label: 'LinkedIn', href: linkedinUrl },
  // TODO: add email and any other channels worth publishing.
];

/**
 * The "Currently" line on the homepage. Edit this file to update it:
 * it is intentionally the single cheapest thing on the site to change.
 *
 * `href` and `accent` are per-item so the component never has to know which
 * string is special.
 */
export interface CurrentlyItem {
  label: string;
  /** App-relative path. When set, the item renders as a link. */
  href?: string;
  /** Renders the item in the site accent. Use it sparingly: one is plenty. */
  accent?: boolean;
}

export const currently: CurrentlyItem[] = [
  { label: 'Building Alfredo', href: '/alfredo', accent: true },
  { label: 'Making AI do useful things' },
  { label: 'Building products I wish already existed' },
];
