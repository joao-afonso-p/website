# Authoring content

Everything on this site except the homepage copy, the nav and the footer lives in
this folder as Markdown. One file = one entry. For builds and side quests the
filename (without extension) is the URL slug, so `builds/tide.md` becomes
`/builds/tide`. Work entries have no page of their own: the filename is the
chapter's anchor on `/work`, so `work/enlitia.mdx` is `/work/#enlitia`.

```
src/content/
  builds/        products and tools        → /builds/<slug>
  side-quests/   smaller, stranger things  → /side-quests/<slug>
  work/          roles                     → chapters of /work
```

Schemas live in `src/content.config.ts`. Pages never read the collections
directly: they go through `src/lib/content.ts`, which handles drafts and
sorting.

## Frontmatter vs body

**Frontmatter is only what a list row, a sort or a status dot needs.** Keep it
short. If you are tempted to add a field, it probably belongs in the body.

**The body is the writing.** Use `##` headings: they are the structure of the
page. Suggested skeletons:

| Collection  | Sections                                                                         |
| ----------- | -------------------------------------------------------------------------------- |
| builds      | `## Why it exists`, `## What I built`, `## Decisions`, `## What I learned`       |
| side-quests | `## Context`, `## My involvement`, `## What came out of it`, `## What I learned` |
| work        | `###` headings only, since each role is a chapter under an `h2` (see below)      |

Skip a section rather than padding it. Short and true beats complete.

## Fields

`?` = optional. Omit optional keys entirely instead of leaving an empty value:
consumers render nothing for an absent field, but an empty string is still a
field that got rendered.

Every collection has `draft` (default `false`). `tags` defaults to `[]`.

### builds

| Field          | Type     | Notes                                                  |
| -------------- | -------- | ------------------------------------------------------ |
| `title`        | string   | Required. The project name.                            |
| `oneLiner`     | string   | Required. One sentence, shown in lists and at the top. |
| `description?` | string   | Two or three sentences for listing rows and meta tags. |
| `year?`        | number   | Display only.                                          |
| `status?`      | enum     | `live` `building` `experiment` `paused` `archived`.    |
| `tags`         | string[] | Free-form. Lowercase.                                  |
| `stack?`       | string[] | Technologies, if worth naming.                         |
| `url?`         | string   | Live link.                                             |
| `repo?`        | string   | Source link.                                           |
| `featured`     | boolean  | `true` puts it in the homepage Selected Builds table.  |
| `order?`       | number   | Manual sort, ascending. Lower = earlier.               |
| `cover?`       | image    | Relative path, e.g. `./cover.png`, next to the `.md`.  |
| `coverAlt?`    | string   | Required in practice whenever `cover` is set.          |
| `updated?`     | date     | Last meaningful change.                                |

### side-quests

Same idea, plus the fields for things that happened inside an organisation:

| Field                      | Notes                                                          |
| -------------------------- | -------------------------------------------------------------- |
| `title`, `oneLiner`        | Required.                                                      |
| `headline?`                | The page's `h1`. `title` becomes the eyebrow above it.         |
| `description?`             | Listing summary: what the timeline row says.                   |
| `intro?`                   | The lead under the headline. Distinct from `description`.      |
| `org?`, `role?`            | Where it happened and what you were.                           |
| `period?`                  | Free-form string: a season or a date range.                    |
| `yearLabel?`               | The timeline's year label: a year, a range, or one ending Now. |
| `year?`, `status?`, `tags` | As in builds. `year` sorts; `yearLabel` is what renders.       |
| `url?`, `cta?`, `repo?`    | As in builds.                                                  |
| `featured`                 | `true` gives the timeline entry more room and a heavier rule.  |
| `order?`                   | Manual sort, ascending. Lower = earlier in the list.           |

`/side-quests` is a chronology rather than a ranked index, but it runs newest
first like `/builds`, and the detail pages' Later/Earlier links follow the same
order. The eyebrow metadata line on a detail page is composed, in this order,
from `period`, `org`, `role` and `tags`, so a line like `2021 · SHARKCODERS`
is just those fields joined.

Side quest bodies are `.mdx` and use the components in
`src/components/quest/`: `Photo` and `PhotoPair` for documentary photographs
(one hairline, no glass: that is the deliberate difference from the
screenshots on /builds), `Milestones` for a few dated results, and
`ExternalLink` for a link inside a sentence. `case/PullQuote`,
`case/Numbered`, `case/MetaLine` and `case/PhoneFigure` are shared with builds.
Pass a pull quote as `text="…"`, not as a slot, unless it fits on one line.
See the note in `PullQuote.astro` for why.

### work

`/work` is one continuous page, not an index. Each file is a chapter of a
single timeline, sorted by `start`, oldest first, and there are no per-role
pages. So the frontmatter describes a chapter: where it sits in time, and the
lines it opens on.

| Field               | Notes                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| `company`           | Required. The chapter's `h2`.                                           |
| `role`              | Required. The title held first.                                         |
| `laterRole?`        | A later title at the same company. Renders as `<role>, later <this>`.   |
| `start`             | Required. `2022-11` style. Only its year is shown; it also sorts.       |
| `end?`              | Omit on the current role. Not rendered; kept for the record.            |
| `current`           | `true` gives the spine marker the accent. End dates are not shown.      |
| `location?`         | City, or `Remote`.                                                      |
| `url?`, `urlLabel?` | The company's site. The label defaults to the hostname.                 |
| `stage`             | Required. The one-word shift, e.g. `Teams`. Feeds the top strip too.    |
| `headline`          | Required. The sentence under the company name.                          |
| `intro?`            | Short context under the headline.                                       |
| `featured`          | `true` for the central chapter: a filled marker on the spine, more air. |
| `order?`            | Tiebreaker only.                                                        |

Bodies are `.mdx`. Use `###` for sections, since the company name is already
the `h2`, and the components in `src/components/work/`: `Phase` for a role that
was really two stretches of work, `Callout` for a realization mid-chapter,
`Quote` for one of the page's few large lines, `Sequence` for an ordered
progression, `Ledger` for exact labelled facts, `Milestone` for a target against
a result, `Range` for the one technical-range band, and `WorkLink` for a
contextual link. `quest/ExternalLink` works for a link inside a sentence.

Dates are forgiving: `2026-03-12`, `2026-03`, `2026` and `'2026'` are all
accepted and normalised. A wrong shape fails the build rather than silently
producing the wrong date.

## Drafts

```yaml
draft: true
```

A draft is **visible in `pnpm dev` and absent from `pnpm build`**. That is the
whole workflow: start every entry as a draft, look at it in the browser, delete
`draft: true` when it is ready. Nothing is published by accident, and nothing
has to live in a branch while it is unfinished.

No collection carries a template any more: copy the entry closest to what you
are writing instead, which is a better starting point than a skeleton once a
collection has real entries.

## TODOs

Unknown facts are marked, never guessed:

- a `# TODO: ...` comment next to a placeholder value in frontmatter, or the
  key omitted entirely with a commented list of what is missing;
- a body line starting with `TODO:`.

Search the folder for `TODO` to find everything still waiting on a real answer.

## Publishing

```bash
# 1. write
pnpm dev                      # drafts included, hot reload

# 2. check
pnpm build                    # fails loudly on a bad schema or a broken reference

# 3. ship
git add src/content
git commit -m "content: add <entry>"
git push
```

Pushing to the default branch triggers the GitHub Actions build and deploy.
A minute or so later the entry is live. There is no CMS, no preview
environment and no database. The repository is the source of truth.
