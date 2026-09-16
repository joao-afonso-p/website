# Authoring content

Everything on this site except the homepage copy, the nav and the footer lives in
this folder as Markdown. One file = one entry. The filename (without extension)
is the URL slug, so `builds/tide.md` becomes `/builds/tide`.

```
src/content/
  builds/        products and tools        → /builds/<slug>
  side-quests/   smaller, stranger things  → /side-quests/<slug>
  work/          roles                     → /work/<slug>
  notes/         writing                   → /notes/<slug>
```

Schemas live in `src/content.config.ts`. Pages never read the collections
directly — they go through `src/lib/content.ts`, which handles drafts and
sorting.

## Frontmatter vs body

**Frontmatter is only what a list row, a sort or a status dot needs.** Keep it
short. If you are tempted to add a field, it probably belongs in the body.

**The body is the writing.** Use `##` headings — they are the structure of the
page. Suggested skeletons:

| Collection  | Sections                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| builds      | `## Why it exists`, `## What I built`, `## Decisions`, `## What I learned`                              |
| side-quests | `## Context`, `## My involvement`, `## What came out of it`, `## What I learned`                        |
| work        | `## What the work was`, `## What I built`, `## What I learned`, `## Things that don't fit in my résumé` |
| notes       | free-form; two or three `##` sections at most                                                           |

Skip a section rather than padding it. Short and true beats complete.

## Fields

`?` = optional. Omit optional keys entirely instead of leaving an empty value —
consumers render nothing for an absent field, but an empty string is still a
field that got rendered.

Every collection has `draft` (default `false`). `tags` defaults to `[]`.

### builds

| Field           | Type         | Notes                                                  |
| --------------- | ------------ | ------------------------------------------------------ |
| `title`         | string       | Required. The project name.                            |
| `oneLiner`      | string       | Required. One sentence, shown in lists and at the top. |
| `description?`  | string       | Two or three sentences for listing rows and meta tags. |
| `year?`         | number       | Display only.                                          |
| `status?`       | enum         | `live` `building` `experiment` `paused` `archived`.    |
| `tags`          | string[]     | Free-form. Lowercase.                                  |
| `stack?`        | string[]     | Technologies, if worth naming.                         |
| `url?`          | string       | Live link.                                             |
| `repo?`         | string       | Source link.                                           |
| `featured`      | boolean      | `true` puts it in the homepage Selected Builds table.  |
| `order?`        | number       | Manual sort, ascending. Lower = earlier.               |
| `cover?`        | image        | Relative path, e.g. `./cover.png`, next to the `.md`.  |
| `coverAlt?`     | string       | Required in practice whenever `cover` is set.          |
| `relatedNotes?` | note slugs[] | e.g. `[building-tide]`. Must match files in `notes/`.  |
| `updated?`      | date         | Last meaningful change.                                |

### side-quests

Same idea, plus the fields for things that happened inside an organisation:

| Field                                       | Notes                                 |
| ------------------------------------------- | ------------------------------------- |
| `title`, `oneLiner`                         | Required.                             |
| `description?`                              | Listing summary.                      |
| `org?`, `role?`                             | Where it happened and what you were.  |
| `period?`                                   | Free-form string, e.g. `2021 — 2022`. |
| `year?`, `status?`, `tags`, `url?`, `repo?` | As in builds.                         |
| `featured`, `order?`                        | As in builds.                         |

### work

| Field                                              | Notes                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `company`                                          | Required.                                                                  |
| `role`                                             | Required. The job title.                                                   |
| `oneLiner`                                         | Required. One sentence on what you did there.                              |
| `title?`                                           | Display override for when the real job title reads badly.                  |
| `period?`                                          | The string that actually gets rendered, e.g. `2023 — present`.             |
| `start?`,`end?`                                    | Sorting only, never displayed. `2023-04-01`, `2023-04` or `2023` all work. |
| `current`                                          | `true` pins the role to the top of `/work`.                                |
| `location?`                                        | City, or `Remote`.                                                         |
| `description?`, `tags`, `stack?`, `url?`, `order?` | As in builds.                                                              |

### notes

| Field           | Notes                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| `title`         | Required.                                                              |
| `date`          | Required. `YYYY-MM-DD`. The only required date on the site.            |
| `description?`  | One or two sentences; used in the list and in meta tags.               |
| `updated?`      | Set when you revise a published note.                                  |
| `tags`          | Free-form.                                                             |
| `series?`       | Groups a multi-part thread under one name.                             |
| `status?`       | Free-form display label, e.g. `FIELD NOTE`. Not the builds enum.       |
| `relatedBuild?` | A build slug, e.g. `tide`. Links the note and the build to each other. |
| `featured`      | Reserved for highlighting a note.                                      |

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

The `example-*.md` file in each folder is a permanent draft template. Copy it,
rename it, strip the TODOs. Leave the original alone.

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
environment and no database — the repository is the source of truth.
