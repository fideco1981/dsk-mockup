import { session } from './session.js';

// Singleton (see sanity.config.js): the weekly lift hours on index.html,
// om-oss.html and kontakt.html. A day without an entry is closed. While it
// doesn't exist, the pages show their hand-written fallback.
export const liftHours = {
  name: 'liftHours',
  title: 'Heistider',
  type: 'document',
  fields: [
    {
      name: 'hours',
      title: 'Åpningstider',
      type: 'array',
      description: 'Én linje per dag heisen går. Dager uten linje vises som «Heis stengt».',
      of: [session],
      validation: (Rule) =>
        Rule.custom((hours) => {
          const days = (hours || []).map((s) => s && s.day).filter(Boolean);
          return new Set(days).size === days.length ? true : 'Hver dag kan bare ha én linje.';
        }),
    },
    {
      name: 'note',
      title: 'Merknad',
      type: 'text',
      rows: 3,
      description: 'Vises under åpningstidene, for eksempel at bakken kan være stengt i ferier.',
    },
  ],
  preview: { prepare: () => ({ title: 'Heistider' }) },
};
