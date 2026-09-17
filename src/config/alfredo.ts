/**
 * The Alfredo capability record.
 *
 * This is the whole content model for the page: one entry per capability, in
 * display order. Editing this array is the only thing needed to add, reorder,
 * promote or describe a capability — the page derives everything else.
 *
 * `planned: true` renders a hollow marker and a muted title; `false` renders a
 * filled blue marker. The first non-planned capability is the one expanded by
 * default, so the page is readable before any JavaScript runs.
 */
export interface AlfredoCapability {
  /** Two-digit index shown in the first column. */
  number: string;
  title: string;
  /** Short status word shown on the right, e.g. `Ready`. */
  status: string;
  /** Not built yet: hollow marker, muted title. */
  planned: boolean;
  /** Small blue label above the detail, e.g. `People extension`. */
  label?: string;
  whatItDoes?: string;
  whatILearned?: string;
  /**
   * Optional write-up link: an app-relative path (e.g. `/builds/tide`) or an
   * absolute external URL, which opens in a new tab.
   */
  linkHref?: string;
  /** Link text. Defaults to `Read note`. */
  linkLabel?: string;
}

export const alfredoCapabilities: AlfredoCapability[] = [
  // TODO: replace with the real capability. Keep the shape; every field below
  // except `number`, `title`, `status` and `planned` is optional.
  {
    number: '01',
    title: 'TODO: capability name',
    status: 'Planned',
    planned: true,
    whatItDoes: 'TODO: what this capability does, in one or two sentences.',
    whatILearned: 'TODO: what building it changed in how you think.',
  },
  // TODO: replace with the real capability.
  {
    number: '02',
    title: 'TODO: capability name',
    status: 'Planned',
    planned: true,
    whatItDoes: 'TODO: what this capability does, in one or two sentences.',
    whatILearned: 'TODO: what building it changed in how you think.',
  },
  // TODO: replace with the real capability.
  {
    number: '03',
    title: 'TODO: capability name',
    status: 'Planned',
    planned: true,
    whatItDoes: 'TODO: what this capability does, in one or two sentences.',
    whatILearned: 'TODO: what building it changed in how you think.',
  },
  {
    number: '04',
    title: 'Scheduled messages',
    status: 'Ready',
    planned: false,
    label: 'People extension',
    whatItDoes:
      'Lets me schedule an exact Telegram message to an opted-in contact, after I approve the recipient, wording and time.',
    whatILearned:
      'External communication needs consent, clear authorship and no automatic retry when delivery is uncertain.',
    // TODO: add `linkHref` once there is a write-up to point at.
  },
  // TODO: replace with the real capability.
  {
    number: '05',
    title: 'TODO: capability name',
    status: 'Planned',
    planned: true,
    whatItDoes: 'TODO: what this capability does, in one or two sentences.',
    whatILearned: 'TODO: what building it changed in how you think.',
  },
  // TODO: replace with the real capability.
  {
    number: '06',
    title: 'TODO: capability name',
    status: 'Planned',
    planned: true,
    whatItDoes: 'TODO: what this capability does, in one or two sentences.',
    whatILearned: 'TODO: what building it changed in how you think.',
  },
];
