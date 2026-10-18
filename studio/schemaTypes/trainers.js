// Singleton (see sanity.config.js): the trainers on trenere.html. While it
// doesn't exist or Sanity fails, Trenere hides the trainers (no fallback).
import { contactDetailsFields } from './contactDetails.js';

export const trainers = {
  name: 'trainers',
  title: 'Trenere',
  type: 'document',
  fields: [
    {
      name: 'trainers',
      title: 'Trenere',
      type: 'array',
      description:
        'Dra for å endre rekkefølgen på siden. Bare trenere som er 18 år eller eldre. ' +
        'Sitter en trener også i styret, legges personen inn her også, med eget samtykke.',
      of: [
        {
          type: 'object',
          name: 'trainer',
          title: 'Trener',
          fields: [
            { name: 'name', title: 'Navn', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'role',
              title: 'Rolle',
              type: 'string',
              description: 'Valgfritt, kort. For eksempel «Hovedtrener».',
            },
            {
              name: 'presentation',
              title: 'Presentasjon',
              type: 'text',
              rows: 4,
              description: 'Noen setninger om treneren. Høyst 400 tegn.',
              validation: (Rule) => Rule.max(400),
            },
            {
              name: 'merits',
              title: 'Meritter',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Én merittlinje per punkt, også trenerutdanning (for eksempel «Trener 2 alpint»).',
            },
            ...contactDetailsFields,
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Trenere' }) },
};
