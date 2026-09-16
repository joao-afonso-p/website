import { defineCollection, reference } from 'astro:content';
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
 * Builds — the products and tools that are the spine of the site.
 *
 * `featured` + `order` exist so the homepage's Selected Builds table can be
 * curated by hand instead of inferred from dates. `relatedNotes` lets a build
 * point at the writing that came out of it without duplicating either side.
 */
const builds = defineCollection({
  loader: glob({ base: './src/content/builds', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      oneLiner: z.string(),
      description: z.string().optional(),
      year: looseYear.optional(),
      status: statusSchema.optional(),
      tags: tagList,
      stack: z.array(z.string()).optional(),
      url: z.string().optional(),
      repo: z.string().optional(),
      featured: z.boolean().default(false),
      order: looseYear.optional(),
      draft: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      relatedNotes: z.array(reference('notes')).optional(),
      updated: looseDate.optional(),
    }),
});

/**
 * Side quests — smaller, stranger or shorter-lived things, including work done
 * inside someone else's organisation. Hence `org`, `role` and a human-written
 * `period` string: these entries are often a season rather than a launch date.
 */
const sideQuests = defineCollection({
  loader: glob({ base: './src/content/side-quests', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string(),
    description: z.string().optional(),
    org: z.string().optional(),
    role: z.string().optional(),
    period: z.string().optional(),
    year: looseYear.optional(),
    status: statusSchema.optional(),
    tags: tagList,
    url: z.string().optional(),
    repo: z.string().optional(),
    featured: z.boolean().default(false),
    order: looseYear.optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Work — the résumé-shaped record. `period` is the string that gets rendered;
 * `start` / `end` exist only so the list can sort itself, and `current` keeps
 * an ongoing role at the top without needing an end date sentinel.
 * `title` overrides the display heading when `role` alone reads badly.
 */
const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    title: z.string().optional(),
    period: z.string().optional(),
    start: looseDate.optional(),
    end: looseDate.optional(),
    current: z.boolean().default(false),
    location: z.string().optional(),
    oneLiner: z.string(),
    description: z.string().optional(),
    tags: tagList,
    stack: z.array(z.string()).optional(),
    url: z.string().optional(),
    order: looseYear.optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Notes — writing. `date` is the only required date on the site because notes
 * are the one collection that is genuinely chronological. `status` is free-form
 * on purpose (e.g. `FIELD NOTE`, `WORKING NOTE`) so a label can be invented
 * without touching this file. `series` groups a multi-part thread.
 */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: looseDate,
    description: z.string().optional(),
    updated: looseDate.optional(),
    tags: tagList,
    series: z.string().optional(),
    status: z.string().optional(),
    relatedBuild: reference('builds').optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { builds, sideQuests, work, notes };
