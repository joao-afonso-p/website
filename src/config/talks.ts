/**
 * Talks and appearances.
 *
 * A talk has no page and no body: it is a date, an event, a subject where the
 * record establishes one, and an optional link. That makes it configuration,
 * not content, so it lives here beside the nav and the Currently line rather
 * than in `src/content`. The Notes page is the only reader.
 *
 * Authoring rules, kept deliberately strict:
 *
 * - `date` is machine-readable when known. Month precision (`'2026-03'`) is the
 *   usual case and prints as `Mar 2026`; add a day only when it is known and
 *   worth showing. Use `'TBD'` for an upcoming appearance with no confirmed date.
 * - `subject` is a short English line, only where the source actually states
 *   what the talk was about. Do not invent an official title.
 * - `url` points at a real recording or talk page. Omit it rather than guess.
 *
 * Order is derived, never authored: `talkSchedule()` splits the list into
 * upcoming (soonest first) and past (newest first) against the current date.
 *
 * Photos: a talk's pictures live in `src/assets/talks/<slug>/` and are picked up
 * automatically by the Talks section, which turns the talk into a trigger for a
 * small gallery. Dropping files into that folder is the whole workflow; no field
 * here points at them. See `src/components/notes/Talks.astro` and the README.
 */
export interface Talk {
  /**
   * Stable identifier. It is the folder name under `src/assets/talks/` where the
   * talk's photos live, and the id of its gallery dialog, so keep it short,
   * kebab-case and unique.
   */
  slug: string;
  /** `'YYYY-MM'`, `'YYYY-MM-DD'` or `'TBD'` when the date is not confirmed. */
  date: string;
  /** The event, series or venue. */
  event: string;
  /** City, or venue and city. Shown beside the date. Set it only when known. */
  location?: string;
  /** What the talk was about, only where the source establishes it. */
  subject?: string;
  /** A relevant link: a recording or a talk page. Omit when there is no real one. */
  url?: string;
  /** Overrides the default link label (otherwise the link's host). */
  urlLabel?: string;
}

/**
 * Past talks, drawn from the public LinkedIn record. Awards and mentoring roles
 * are deliberately excluded: this is talks only. Order here does not matter.
 */
export const talks: Talk[] = [
  {
    slug: 'vertical-2026',
    date: 'TBD',
    event: 'Vertical D. Henrique Cowork',
    location: 'Porto',
    subject:
      'Knowing when to reach for generative AI and LLMs, when traditional ML is the better fit, and when the right answer is something deterministic.',
  },
  {
    slug: 'eneeb-2026',
    date: '2026-03',
    event: 'ENEEB 2026',
    subject: 'AI in healthcare, Loka, and the path from biomedical engineering into an AI career.',
  },
  {
    slug: 'vcmi-2025',
    date: '2025-05',
    event: 'VCMI Invited Talks #8',
    subject: 'Deploying machine learning into production systems.',
    url: 'https://www.youtube.com/watch?v=h8wdHsOkn0Q',
    urlLabel: 'Recording',
  },
  {
    slug: 'bioengineering-2025',
    date: '2025-03',
    event: 'Symposium on Bioengineering 2025',
    subject: 'Three bioengineers building a pet food company.',
  },
  {
    slug: 'challanje-2024',
    date: '2024-11',
    event: 'ChallANJE 2024',
    subject: 'Full Belly, pitched.',
  },
  {
    slug: 'city-cafe-2023',
    date: '2023-12',
    event: 'City Café: O Poder dos Dados',
    subject: 'Data for greener cities.',
    url: 'https://www.youtube.com/watch?v=kTyDRd6Kqg0',
    urlLabel: 'Recording',
  },
  {
    slug: 'pycon-2022',
    date: '2022-09',
    event: 'PyCon Portugal 2022',
    url: 'https://pretalx.evolutio.pt/pyconpt2022/talk/H8ZHTY/',
    urlLabel: 'Talk page',
  },
];

/** A talk with its display label and sort key resolved from `date`. */
export interface ScheduledTalk extends Talk {
  /** `Mar 2026`, `5 Nov 2026`, or `TBD` when the date is unknown. */
  label: string;
  /** A value valid for `<time datetime>`: the `date` string as authored. */
  datetime?: string;
}

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `{ time, label }` for a `'YYYY-MM'` or `'YYYY-MM-DD'` string. */
function resolveDate(date: string): { time: number | null; label: string } {
  if (date.trim().toUpperCase() === 'TBD') return { time: null, label: 'TBD' };
  const month = /^(\d{4})-(\d{2})$/.exec(date.trim());
  if (month) {
    const time = Date.UTC(Number(month[1]), Number(month[2]) - 1, 1);
    return { time, label: monthFormatter.format(time) };
  }
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (day) {
    const time = Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
    return { time, label: dayFormatter.format(time) };
  }
  // A malformed date is an authoring error, not something to paper over.
  throw new Error(`Talk date "${date}" is not 'YYYY-MM' or 'YYYY-MM-DD'.`);
}

/**
 * Split the talks into upcoming and past against `now`.
 *
 * Upcoming are sorted soonest first (the next thing on the calendar leads);
 * past are sorted newest first. The boundary is the start of today in UTC, so a
 * talk dated to the current month still reads as upcoming on its own day.
 */
export function talkSchedule(now: Date = new Date()): {
  upcoming: ScheduledTalk[];
  past: ScheduledTalk[];
} {
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const resolved = talks.map((talk) => {
    const { time, label } = resolveDate(talk.date);
    return {
      talk: { ...talk, label, ...(time === null ? {} : { datetime: talk.date }) },
      time,
    };
  });

  const upcoming = resolved
    .filter((entry) => entry.time === null || entry.time >= startOfToday)
    .sort((a, b) => {
      if (a.time === null) return b.time === null ? 0 : 1;
      if (b.time === null) return -1;
      return a.time - b.time;
    })
    .map((entry) => entry.talk);

  const past = resolved
    .filter((entry) => entry.time !== null && entry.time < startOfToday)
    .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
    .map((entry) => entry.talk);

  return { upcoming, past };
}
