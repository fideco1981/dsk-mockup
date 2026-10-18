// Singleton (see sanity.config.js): the board on styret.html. While it doesn't
// exist or Sanity fails, Styret hides the board (no fallback).
import { contactDetailsFields } from './contactDetails.js';

const POSITIONS = ['Styreleder', 'Nestleder', 'Sportslig leder', 'Styremedlem', 'Vara'];

export const board = {
  name: 'board',
  title: 'Styret',
  type: 'document',
  fields: [
    {
      name: 'term',
      title: 'Valgperiode',
      type: 'string',
      description: 'Én linje øverst på siden, for eksempel «Valgt på årsmøtet 2026, sittende inntil årsmøtet 2027».',
    },
    {
      name: 'members',
      title: 'Styremedlemmer',
      type: 'array',
      description:
        'Dra for å endre rekkefølgen på siden. Varamedlemmer vises i egen gruppe. Telefon og e-post fylles inn i egne felt per person, og vises bare med samtykke.',
      of: [
        {
          type: 'object',
          name: 'boardMember',
          title: 'Styremedlem',
          fields: [
            { name: 'name', title: 'Navn', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'position',
              title: 'Verv',
              type: 'string',
              options: { list: POSITIONS.map((p) => ({ title: p, value: p })) },
              validation: (Rule) => Rule.required(),
            },
            ...contactDetailsFields,
          ],
          preview: { select: { title: 'name', subtitle: 'position' } },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Styret' }) },
};
