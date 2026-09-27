import { linkedinUrl } from './site';

/**
 * The Alfredo capability map.
 *
 * This file is the whole content model for /alfredo. Adding, reordering,
 * repositioning or repromoting a capability is a change here and nowhere else:
 * the desktop constellation, the mobile sequence and the detail panels are all
 * derived from this array, so no string is written twice.
 *
 * Two ideas keep it maintainable as Alfredo grows:
 *
 *  1. Status is a token, not a style. `alfredoStatuses` is the single place
 *     that decides what a status is called and how its connection, marker and
 *     motion behave. A capability only names its status.
 *  2. Position is polar, not pixel. Each capability declares an angle and a
 *     radius from Alfredo; the component turns that into coordinates. Radius
 *     is the page's quietest signal: the closer to the centre, the more
 *     foundational the capability, which is why Memory sits nearest.
 */

/**
 * `inProgress` and `later` are unused right now: everything on the map is
 * either working, being validated, or committed to but not started. They stay
 * in the model because both are real states that will come back, and the
 * legend renders only the statuses actually in use, so an unused one costs
 * nothing on the page.
 */
export type AlfredoStatus = 'live' | 'validating' | 'inProgress' | 'next' | 'later';

export interface AlfredoStatusStyle {
  /** Shown on the node and in the panel. Uppercased by the type style. */
  label: string;
  /** `accent` draws in the site blue; `quiet` draws in the hairline grey. */
  tone: 'accent' | 'quiet';
  /** SVG `stroke-dasharray` for the connection. Absent means a solid line. */
  dash?: string;
  /** Resting opacity of the whole connection. */
  opacity: number;
  /**
   * `pulse` adds one slow marker near the outer end of the connection;
   * `drift` moves the dashes slowly along it. Both are suppressed under
   * `prefers-reduced-motion`, where the line treatment alone carries the state.
   */
  motion: 'none' | 'pulse' | 'drift';
  /** Filled reads as arrived; hollow reads as not yet. */
  marker: 'filled' | 'hollow';
  /** Mutes the capability name, the way the rest of the site mutes a plan. */
  subdued: boolean;
}

export const alfredoStatuses: Record<AlfredoStatus, AlfredoStatusStyle> = {
  live: {
    label: 'Live',
    tone: 'accent',
    opacity: 0.55,
    motion: 'none',
    marker: 'filled',
    subdued: false,
  },
  validating: {
    label: 'Validating',
    tone: 'accent',
    opacity: 0.5,
    motion: 'pulse',
    marker: 'filled',
    subdued: false,
  },
  inProgress: {
    label: 'In progress',
    tone: 'accent',
    dash: '5 7',
    opacity: 0.5,
    motion: 'drift',
    marker: 'hollow',
    subdued: false,
  },
  next: {
    label: 'Next',
    tone: 'quiet',
    dash: '1 6',
    opacity: 0.85,
    motion: 'none',
    marker: 'hollow',
    subdued: true,
  },
  later: {
    label: 'Later',
    tone: 'quiet',
    dash: '1 8',
    opacity: 0.7,
    motion: 'none',
    marker: 'hollow',
    subdued: true,
  },
};

/** Where a capability's label sits relative to the point its connection ends. */
export type AlfredoAnchor = 'left' | 'right' | 'top' | 'bottom';

export interface AlfredoCapability {
  /** Stable slug. Used for ids and for the optional `#hash` deep link. */
  id: string;
  name: string;
  /** Small mono qualifier, e.g. `Household system`. */
  category: string;
  status: AlfredoStatus;
  /** One line, shown on hover beside the node and under it on small screens. */
  hint: string;
  /** One sentence at the top of the detail panel. */
  summary: string;
  /** Overrides `What Alfredo can do now` for something not built yet. */
  existsLabel?: string;
  exists: string[];
  /** Overrides `What I learned` for something with a question instead. */
  learningLabel?: string;
  learning: string;
  /** An explicit limit worth publishing. Rendered under its own label. */
  boundary?: string;
  /** Why a status is not the next one up. Only where that needs saying. */
  note?: string;
  /** Supporting systems, named plainly. Never logos, never endpoints. */
  systems?: string[];
  /**
   * Position on the constellation. `angle` is degrees counter-clockwise from
   * three o'clock; `radius` is distance from Alfredo before the map's vertical
   * flattening is applied. `anchor` is derived from the angle unless set.
   */
  map: { angle: number; radius: number; anchor?: AlfredoAnchor };
}

/**
 * Geometry of the desktop constellation, in its own design units. The canvas
 * scales as one piece, so these numbers stay stable at every width.
 *
 * `flatten` squashes the vertical axis: the canvas is much wider than it is
 * tall, and an unflattened ring would push the top and bottom nodes off it
 * while leaving the sides empty. It is also what stops the layout reading as a
 * spider diagram.
 *
 * `core*` describe the invisible rectangle around the Alfredo node that every
 * connection starts outside of, so no line is ever drawn under its glass.
 */
export const alfredoMap = {
  width: 1200,
  height: 780,
  centerX: 600,
  centerY: 378,
  flatten: 0.8,
  coreHalfWidth: 130,
  coreHalfHeight: 52,
  coreGap: 12,
} as const;

/**
 * Display order. This is also the reading order of the mobile sequence and the
 * tab order, so it runs foundational first and furthest away last.
 */
export const alfredoCapabilities: AlfredoCapability[] = [
  {
    id: 'memory',
    name: 'Memory',
    category: 'Core',
    status: 'live',
    hint: 'Durable context that comes back when it matters.',
    summary: 'Keeps useful context over time and brings it back when a decision actually needs it.',
    exists: [
      'Persistent context across everything Alfredo does',
      'Human-readable knowledge in Obsidian, instead of disappearing into some mysterious database',
      'Separate memory for different parts of life, rather than one giant bucket of everything I have ever said',
      'Durable knowledge kept separate from temporary runtime state',
      'Context brought back into ongoing workflows, not just when I explicitly ask Alfredo to remember something',
    ],
    learning:
      'Alfredo does not need to remember everything about me. That would be creepy and mostly useless. He needs to remember the right thing at the right time.',
    systems: ['Obsidian', 'OpenClaw'],
    map: { angle: 20, radius: 265 },
  },

  {
    id: 'food',
    name: 'Food',
    category: 'Household system',
    status: 'live',
    hint: 'From meal planning to the real grocery cart.',
    summary:
      'Connects meal planning, what we probably have at home, recipes, feedback, shopping and the actual grocery cart.',
    exists: [
      'Meal planning that stays conversational until I actually approve it',
      'A deliberately fuzzy pantry: confirmed, probably there, or missing, because pretending Alfredo knows there are exactly three onions would be a lie',
      'One canonical version of each recipe, instead of slowly creating five almost-identical ones',
      'Feedback kept separate from the recipe, with adjustments queued for next time',
      'A shopping list that stays a shopping list and is never silently “improved”',
      'Product matching and real cart preparation in Continente Online',
      'Alfredo can prepare the cart. Checkout remains a human privilege',
    ],
    learning:
      'The useful part is not planning the meal. It is remembering what happened when we actually cooked it.',
    systems: ['Obsidian', 'Continente Online', 'Browser automation'],
    map: { angle: 340, radius: 340 },
  },

  {
    id: 'people',
    name: 'People',
    category: 'People OS',
    status: 'live',
    hint: 'People, dates, gifts and open loops.',
    summary:
      'Keeps the people I care about, important dates, gift ideas and unfinished things connected early enough to actually do something about them.',
    exists: [
      'One canonical record per person, even when I refer to them in different ways',
      'Important dates treated as preparation windows, not notifications that arrive when it is already too late',
      'Gift ideas and gift history, so I do not have the same brilliant idea twice',
      'Activities and open loops attached to the person they actually belong to',
      'Silence when there is genuinely nothing useful left to do',
    ],
    learning:
      'Remembering someone’s birthday on the day is technically correct and practically useless. Alfredo treats it more like a tiny project with a deadline.',
    systems: ['Obsidian', 'OpenClaw scheduler', 'Telegram'],
    map: { angle: 168, radius: 330 },
  },

  {
    id: 'communication',
    name: 'Communication',
    category: 'People extension',
    status: 'live',
    hint: 'Approved outbound messages with explicit boundaries.',
    summary:
      'Lets Alfredo schedule and send approved messages without ever becoming confused about who is speaking or what I actually authorised.',
    exists: [
      'Only people who are explicitly authorised and have opted in',
      'Recipient, message, time and channel shown in full before I approve anything',
      'A scheduled outbox that stays editable and cancellable until it runs',
      'Alfredo always speaks as Alfredo and never pretends to be me',
      'If delivery is uncertain, he does not enthusiastically send the same message again',
    ],
    learning:
      'Once Alfredo can speak to other people, consent and authorship stop being implementation details.',
    systems: ['Telegram', 'Scheduled outbox', 'OpenClaw scheduler'],
    map: { angle: 232, radius: 335 },
  },

  {
    id: 'time',
    name: 'Time',
    category: 'Calendar + tasks',
    status: 'live',
    hint: 'Commitments, actions and reminders.',
    summary:
      'Connects calendars, tasks, reminders and context without pretending they are all the same thing.',
    exists: [
      'Google Calendar as the source of truth for commitments, across five accounts, because I decided that one calendar was not enough in my life',
      'Todoist as the source of truth for concrete next actions, currently read-only',
      'Reminders left in the system that can actually remind me, rather than hiding them inside a calendar',
      'Obsidian holding the context and open loops that are neither an event nor a task',
      'Every write tied to the exact account I approved and shown in full before it happens',
      'Different write policies per account, from read-only to reinforced confirmation',
    ],
    learning:
      '“Add this to my calendar” sounds simple until Alfredo has five calendars to choose from. A write is only safe when he knows exactly which one I meant.',
    systems: ['Google Calendar', 'Todoist', 'OpenClaw scheduler', 'Obsidian'],
    map: { angle: 75, radius: 315 },
  },

  {
    id: 'reliability',
    name: 'Reliability',
    category: 'Infrastructure',
    status: 'live',
    hint: 'Backups, recovery and system health.',
    summary:
      'Makes Alfredo recoverable and observable now that rebuilding him from scratch would genuinely ruin my weekend.',
    exists: [
      'Encrypted scheduled backups with retention and verification',
      'Only the state I cannot reconstruct is backed up; logs and generated files can be rebuilt',
      'Restores tested somewhere isolated before I trust any of them',
      'Restore validation covering required files and database integrity',
      'A private health view for capacity, sync, scheduler state and backup freshness',
      'Sanitised status only, because a health dashboard probably should not leak secrets while explaining that everything is healthy',
    ],
    learning:
      'Backups became important around the same time Alfredo became useful enough that losing him would be genuinely annoying.',
    systems: ['Restic', 'Encrypted off-site storage', 'Private control center'],
    map: { angle: 270, radius: 300 },
  },

  {
    id: 'email',
    name: 'Email',
    category: 'Communication',
    status: 'validating',
    hint: 'Useful context without a second inbox.',
    summary:
      'Notices commitments, missing replies and useful context without creating yet another inbox for me to manage.',
    exists: [
      'One logical inbox across several authorised accounts, without copying mail out of Gmail',
      'Read-only by design, with sending blocked at the gateway rather than politely discouraged in a prompt',
      'A separate triage dedicated sub-agent that reads a bounded window and cannot act, schedule or speak',
      'Explicit relevance rules that are dated and reversible instead of becoming permanent truths because of one email',
      'Reply text can be proposed, but drafting and sending are separate approved actions',
    ],
    learningLabel: 'Still figuring out',
    learning:
      'How do I teach Alfredo the difference between “this actually matters” and “someone used the word urgent”?',
    boundary: 'Never speaks as me, and never sends, archives or labels anything.',
    note: 'Built and connected across multiple accounts. Now comes the less glamorous part: seeing whether Alfredo is useful on real email without becoming another source of notifications.',
    systems: ['Gmail', 'Isolated triage agent', 'Obsidian'],
    map: { angle: 200, radius: 350 },
  },

  {
    id: 'capture',
    name: 'Capture',
    category: 'Universal inbox + Ideas OS',
    status: 'next',
    hint: 'Send anything; Alfredo decides where it belongs.',
    summary:
      'One place to throw things before I have to know what they are, why they matter or where they belong.',
    existsLabel: 'Teaching Alfredo next',
    exists: [
      'One capture path for links, notes, voice and whatever else I throw at Alfredo',
      'An ideas area for things that are still half-baked, in readable Markdown',
      'Anything unclear stays in the inbox instead of being confidently filed in the wrong place',
      'Promotion into people, projects or a wishlist once the intent becomes real, linked rather than duplicated',
    ],
    learningLabel: 'Still figuring out',
    learning:
      'Where should something live when even I have no idea yet what I am going to do with it?',
    boundary:
      'Writing something down is not the same as committing to doing it. Alfredo will need to learn the difference too.',
    map: { angle: 130, radius: 370 },
  },

  {
    id: 'research',
    name: 'Research',
    category: 'Personal research radar',
    status: 'next',
    hint: 'A few things worth reading, not a feed.',
    summary:
      'Finds the small number of things genuinely worth my attention without creating another endless thing to keep up with.',
    existsLabel: 'Teaching Alfredo next',
    exists: [
      'A read-only radar pointed at my actual interests, projects and open loops',
      'A deliberately short handful of things rather than an infinite stream',
      'Its own bounded specialist preparing a brief instead of taking action',
      'Nothing subscribed to, shared or acted on without approval',
    ],
    learningLabel: 'Still figuring out',
    learning:
      'I do not need Alfredo to build me another feed. The internet has already produced enough of those. I want a few things that make me think “good catch”, not 47 things I now feel guilty for not reading.',
    map: { angle: 310, radius: 375 },
  },
];

/** Default labels for the detail sections. A capability may override the first two. */
export const alfredoPanelLabels = {
  exists: 'What Alfredo can do now',
  learning: 'What I learned',
  boundary: 'Hard boundary',
  systems: 'Under the hood',
} as const;

/**
 * The standing facts the page still needs. The mono rule above the hero that
 * used to carry a context line, a last-updated date and a small "follow" link
 * has been removed, so only the URL survives, for the closing call to action.
 */
export const alfredoMeta = {
  /**
   * Where the closing "follow" link points. It takes the site's LinkedIn
   * constant rather than repeating the URL, so the footer and this page cannot
   * disagree. Replace it with a literal if Alfredo ever gets a home of its own.
   * The link renders only when this holds a real URL, so setting it to
   * `undefined` removes it cleanly rather than leaving a dead one behind.
   */
  followUrl: linkedinUrl as string | undefined,
};

/** Every line of page copy that is not part of a capability. */
export const alfredoCopy = {
  kicker: 'A personal operating system · One capability at a time',
  heading: 'Building a system that knows when to remember, when to act, and when to ask.',
  intro:
    'Meet Alfredo, the personal operating system I am building around my actual life, one capability at a time.',

  /**
   * The one line above the map. There used to be a legend here as well, a
   * sentence explaining the connection treatments and a row of status
   * swatches, but the statuses are written on every node in words and the map
   * reads without being introduced. This is the only instruction that earns
   * its place, and it is worded for the input each screen actually has.
   */
  tapHint: 'Pick a capability to go deeper',
  clickHint: 'Pick a capability to go deeper',

  closingHeading: 'What I’m building toward',
  closingLead:
    'The goal is not to keep adding integrations. I want Alfredo to gradually understand enough context that it can remove some of the mental overhead from everyday life. More importantly, it needs judgement: knowing when to act, when to ask first, and when the correct action is to do absolutely nothing.',

  /**
   * The closing call to action. It points at the same place as the small
   * "Follow the build" link in the metadata line, so the URL stays in
   * `alfredoMeta.followUrl` and is written down once.
   */
  ctaLabel: 'Follow Alfredo as he grows',
  ctaNote: 'On LinkedIn, as I teach him new things',
  backLabel: 'Back to the rest of the site',
  metaDescription:
    'Alfredo is the personal operating system I am building around memory, context, planning and safe action.',
} as const;
