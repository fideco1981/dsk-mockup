import { session } from './session.js';

// A dated ski-school course. site.js shows it on skiskole.html until its
// endDate has passed, and in the landing page's Treningsplan in the weeks it
// runs (minus skipWeeks). On skiskole.html it is sorted by startDate. Text
// shared by every course lives in the Skiskole singleton (skiSchool).
export const course = {
  name: 'course',
  title: 'Kurs',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Navn',
      type: 'string',
      description: 'Som i Spond, for eksempel «Skiskole ettermiddag uke 1-3 2027».',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'signupDeadline',
      title: 'Påmeldingsfrist',
      type: 'date',
      description: 'Valgfritt. Vises bare som tekst.',
      options: { dateFormat: 'DD.MM.YYYY' },
    },
    {
      name: 'startDate',
      title: 'Startdato',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'Sluttdato',
      type: 'date',
      description: 'Kurset vises på nettsiden til og med denne datoen.',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) =>
        Rule.required().custom((end, { document }) =>
          end && document && document.startDate && end < document.startDate
            ? 'Sluttdato kan ikke være før startdato.'
            : true,
        ),
    },
    {
      name: 'sessions',
      title: 'Kurstider',
      type: 'array',
      description: 'Én linje per ukedag; vises sortert mandag til søndag.',
      of: [session],
    },
    {
      name: 'skipWeeks',
      title: 'Uker uten kurs',
      type: 'array',
      description: 'Valgfritt. Ukenummer uten kurs i perioden, for eksempel 9 for vinterferien.',
      of: [
        {
          type: 'number',
          validation: (Rule) => Rule.integer().min(1).max(53).error('Ukenummer må være et heltall fra 1 til 53.'),
        },
      ],
    },
    {
      name: 'price',
      title: 'Pris',
      type: 'string',
      description: 'Valgfritt. For eksempel «2 950 kroner».',
    },
    {
      name: 'link',
      title: 'Påmeldingslenke',
      type: 'url',
      description: 'Lenken til kurset i Spond. Full adresse som starter med https://.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'note',
      title: 'Merknad',
      type: 'text',
      rows: 3,
      description: 'Valgfritt. For eksempel tillegget for å fortsette i treningsgruppe, eller snøforbehold.',
    },
  ],
  orderings: [{ title: 'Startdato', name: 'startDateAsc', by: [{ field: 'startDate', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'startDate' } },
};
