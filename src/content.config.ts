import { defineCollection } from 'astro:content';
// `z` re-exported from 'astro:content'/'astro:schema' is deprecated and goes
// away in Astro 8; 'astro/zod' is the supported import.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Content collections for the site.
 *
 * Three principles drive every schema below:
 *
 * 1. **Loose on purpose.** Almost everything is optional. Real content arrives
 *    in waves, and a half-known entry should still build and render rather than
 *    fail validation. Consumers must handle absent fields.
 * 2. **Narrative lives in the body, not the frontmatter.** Frontmatter carries
 *    only what a listing row, a status indicator or a sort needs. The story
 *    ("why it exists", "what I built", "what I learned") is Markdown `##`
 *    sections, so it can grow without a schema migration.
 * 3. **Drafts are a first-class state.** `draft: true` keeps an entry visible in
 *    `astro dev` and out of `astro build` (see `src/lib/content.ts`).
 */

/** Lifecycle of a build or side quest. Lowercase here, uppercased for display. */
export const entryStatuses = ['live', 'building', 'experiment', 'paused', 'archived'] as const;

export type EntryStatus = (typeof entryStatuses)[number];

const statusSchema = z.enum(entryStatuses);

/**
 * Dates are authored by hand, so accept the shapes a human actually writes:
 * `2026-03-12`, `2026-03`, `2026`, `'2026'` or a YAML date. Anything else falls
 * through to the standard coercion and fails loudly.
 *
 * Without the year branches a bare `2026` would be read as 2026 *milliseconds*
 * after the epoch, which is a silent wrong answer rather than an error.
 */
const looseDate = z.preprocess((value) => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 1000 && value < 3000) {
    return new Date(Date.UTC(value, 0, 1));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) return new Date(`${trimmed}-01-01T00:00:00Z`);
    if (/^\d{4}-\d{2}$/.test(trimmed)) return new Date(`${trimmed}-01T00:00:00Z`);
  }
  return value;
}, z.coerce.date());

/** Years are display-only, so tolerate a quoted year in frontmatter. */
const looseYear = z.coerce.number().int();

/** Free-form label lists. Default to empty so consumers can always `.map()`. */
const tagList = z.array(z.string()).default([]);

/**
 * Builds: the products and tools that are the spine of the site.
 *
 * `order` curates the sequence on `/builds` by hand instead of inferring it
 * from dates. `featured` is kept for future use; nothing reads it today.
 */
const builds = defineCollection({
  loader: glob({ base: './src/content/builds', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /**
       * A sentence about the build, used as the page's `h1` when present. The
       * `title` then becomes the eyebrow above it: the eyebrow names the thing,
       * the headline says something about it.
       */
      headline: z.string().optional(),
      oneLiner: z.string(),
      description: z.string().optional(),
      /** Ownership, e.g. `Independent project · Product, engineering & strategy`. */
      role: z.string().optional(),
      year: looseYear.optional(),
      /**
       * Replaces the bare `year` in the eyebrow when a build wants to say when
       * it started rather than which year it belongs to, e.g. `Since Jul 2026`.
       * Display-only: `year` still drives the listing row and the sort.
       */
      since: z.string().optional(),
      status: statusSchema.optional(),
      tags: tagList,
      stack: z.array(z.string()).optional(),
      url: z.string().optional(),
      /** Overrides the `Visit <title>` label on the external link. */
      cta: z.string().optional(),
      repo: z.string().optional(),
      featured: z.boolean().default(false),
      order: looseYear.optional(),
      draft: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      updated: looseDate.optional(),
    }),
});

/**
 * Side quests: work that wasn't quite a job and wasn't quite a weekend
 * project, including work done inside someone else's organisation. Hence `org`,
 * `role` and a human-written `period` string: these entries are often a season
 * rather than a launch date.
 *
 * The collection is read as a chronology: `/side-quests` is a timeline running
 * newest first, like builds, and `yearLabel` is the label it actually prints.
 */
const sideQuests = defineCollection({
  loader: glob({ base: './src/content/side-quests', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /**
     * A sentence about the side quest, used as the page's `h1` when present.
     * The `title` then becomes the eyebrow above it, the same contract as builds:
     * the eyebrow names the thing, the headline says something about it.
     */
    headline: z.string().optional(),
    oneLiner: z.string(),
    /**
     * The listing summary: what the timeline row says about the entry.
     */
    description: z.string().optional(),
    /**
     * The lead paragraph under the headline. Separate from `description`
     * because the two are read in different places and are doing different
     * jobs: `description` has to make sense in a list of five, while `intro`
     * has to open a page whose title has already been read.
     */
    intro: z.string().optional(),
    org: z.string().optional(),
    role: z.string().optional(),
    period: z.string().optional(),
    /**
     * The year label on the `/side-quests` timeline, e.g. a single year or an open
     * range ending in `Now`. Display-only, and deliberately separate from `period`: the
     * timeline wants the shortest thing that locates the entry in time, while
     * `period` is the precise span the detail page prints.
     */
    yearLabel: z.string().optional(),
    year: looseYear.optional(),
    status: statusSchema.optional(),
    tags: tagList,
    url: z.string().optional(),
    /** Overrides the `Visit <title>` label on the external link. */
    cta: z.string().optional(),
    repo: z.string().optional(),
    /**
     * A short line under the year on the timeline, set in the accent: the one
     * place the section says something out loud rather than letting the
     * chronology imply it. Reserve it: two of these and neither is noticeable.
     */
    marker: z.string().optional(),
    /**
     * `true` gives the entry more room and a heavier rule on the timeline.
     * For the one side quest that outgrew the others, not a pinned position.
     */
    featured: z.boolean().default(false),
    order: looseYear.optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Work: the professional timeline on `/work`.
 *
 * Unlike builds and side quests there is no detail page per entry. `/work` is
 * one continuous page and every role is a chapter of it, rendered in order, so
 * the frontmatter below describes a chapter rather than a listing row: its
 * place in the chronology and its headline. The narrative itself stays in
 * the MDX body.
 *
 * `start` and `end` are the only dates. The page formats them (`Nov 2022`) and
 * sorts by `start`, oldest first, so nothing is typed twice. `current: true`
 * replaces the end date with `Present`.
 */
const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    company: z.string(),
    /** The job title held first. */
    role: z.string(),
    /** A later title at the same company, e.g. after a change of scope. */
    laterRole: z.string().optional(),
    start: looseDate,
    end: looseDate.optional(),
    current: z.boolean().default(false),
    location: z.string().optional(),
    /** The company's own site. Rendered as a small outward link. */
    url: z.string().optional(),
    /** Display text for `url`, e.g. `enlitia.com`. Defaults to the hostname. */
    urlLabel: z.string().optional(),
    /**
     * The one-word shift this chapter stands for, e.g. `Research` or `Teams`.
     * Read by the progression strip at the top of `/work` as well as the
     * chapter itself, so the strip can never disagree with the timeline.
     */
    stage: z.string(),
    /** The sentence under the company name. */
    headline: z.string(),
    /** Short context under the headline. */
    intro: z.string().optional(),
    /** The central chapter: a heavier marker on the spine and more air. */
    featured: z.boolean().default(false),
    /** Tiebreaker only: `start` already decides the order. */
    order: looseYear.optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { builds, sideQuests, work };
