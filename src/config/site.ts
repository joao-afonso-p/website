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
   * default, not a claim about where anyone is — change the territory freely.
   */
  ogLocale: 'en_GB',
  /** Open Graph / Twitter card image, relative to the site base. */
  ogImage: '/og-default.png',
  /** TODO: set once an X/Twitter handle should be advertised. */
  twitterHandle: undefined as string | undefined,
} as const;

/** Primary navigation. Kept deliberately short. */
export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Builds', href: '/builds' },
  { label: 'Side Quests', href: '/side-quests' },
] as const;

/** Visually separated from the primary nav — Alfredo is its own thing. */
export const alfredoNav = { label: 'Meet Alfredo', href: '/alfredo' } as const;

/**
 * Footer links. Add entries as they become real — an empty value is simply
 * not rendered rather than shown as a dead link.
 */
export const social: Array<{ label: string; href: string }> = [
  { label: 'GitHub', href: 'https://github.com/joao-afonso-p' },
  // TODO: add LinkedIn, email and any other channels worth publishing.
];

/**
 * The "Currently" line on the homepage. Edit this file to update it —
 * it is intentionally the single cheapest thing on the site to change.
 */
export const currently: string[] = [
  'Building Alfredo',
  'Working in applied AI',
  'Experimenting with personal software',
];
