import { TIME } from './event.js';

// Fixed colour list. Each value must have a class in site.js's GROUP_CLASSES
// and in styles.css (.group-*); add to all three together.
export const GROUP_COLOURS = ['Grønn', 'Blå', 'Rød', 'Sort', 'Orange'];
export const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
const timeRule = (Rule) =>
  Rule.required().regex(TIME, { name: 'klokkeslett' }).error('Skriv klokkeslettet som TT:MM, for eksempel 18:00.');

// site.js shows the groups on treningsopplegg.html, sorted by `order`. The
// section anchor is a slug of the title.
export const trainingGroup = {
  name: 'trainingGroup',
  title: 'Treningsgruppe',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Navn',
      type: 'string',
      description: 'For eksempel «Grønn». Lenken til gruppen lages av navnet.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'colour',
      title: 'Farge',
      type: 'string',
      options: { list: GROUP_COLOURS.map((c) => ({ title: c, value: c })), layout: 'radio' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavest tall vises først.',
      initialValue: 10,
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'age',
      title: 'Alder',
      type: 'string',
      description: 'Valgfritt. For eksempel «U8» eller «10–13 år».',
    },
    {
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 5,
      description: 'Valgfritt. Kun ren tekst.',
      validation: (Rule) => Rule.max(500).warning('Hold beskrivelsen kort (maks ca. 500 tegn).'),
    },
    {
      name: 'sessions',
      title: 'Treningstider',
      type: 'array',
      description: 'Valgfritt. Én linje per økt; vises sortert mandag til søndag.',
      of: [
        {
          type: 'object',
          name: 'session',
          title: 'Økt',
          fields: [
            {
              name: 'day',
              title: 'Dag',
              type: 'string',
              options: { list: DAYS.map((d) => ({ title: d, value: d })) },
              validation: (Rule) => Rule.required(),
            },
            { name: 'from', title: 'Fra', type: 'string', description: 'TT:MM, for eksempel 18:00.', validation: timeRule },
            { name: 'to', title: 'Til', type: 'string', description: 'TT:MM, for eksempel 19:30.', validation: timeRule },
          ],
          validation: (Rule) =>
            Rule.custom((s) =>
              s && TIME.test(s.from || '') && TIME.test(s.to || '') && s.to <= s.from
                ? '«Til» må være etter «Fra».'
                : true,
            ),
          preview: {
            select: { day: 'day', from: 'from', to: 'to' },
            prepare: ({ day, from, to }) => ({ title: `${day || '?'} ${from || '?'}–${to || '?'}` }),
          },
        },
      ],
    },
    {
      name: 'place',
      title: 'Sted',
      type: 'string',
      description: 'Valgfritt. For eksempel «Haukåsløypa».',
    },
    {
      name: 'price',
      title: 'Pris',
      type: 'string',
      description: 'Valgfritt. For eksempel «300 kr medlemskap + 3 500 kr treningsavgift».',
    },
  ],
  orderings: [{ title: 'Rekkefølge', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'age' } },
};
