// Fixed chip vocabulary. Each value must have a colour in site.js's chip map
// (Renn → blue, Gratis → orange, Årsmøte → green, Medlemmer → blue); add to both together.
export const CHIPS = ['Renn', 'Gratis', 'Årsmøte', 'Medlemmer'];

// TT:MM, shared with Training group sessions.
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const event = {
  name: 'event',
  title: 'Arrangement',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Tittel',
      type: 'string',
      description: 'Navnet på arrangementet, slik det vises på forsiden.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Dato',
      type: 'date',
      description: 'Arrangementet vises på forsiden fram til og med denne datoen.',
      options: { dateFormat: 'DD.MM.YYYY' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'startTime',
      title: 'Starttid',
      type: 'string',
      description: 'Valgfritt. Skriv som TT:MM, for eksempel 18:00.',
      validation: (Rule) =>
        Rule.regex(TIME, { name: 'klokkeslett' }).error(
          'Skriv klokkeslettet som TT:MM, for eksempel 18:00.',
        ),
    },
    {
      name: 'location',
      title: 'Sted',
      type: 'string',
      description: 'Valgfritt. For eksempel «Haukåsløypa».',
    },
    {
      name: 'description',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 3,
      description: 'Valgfritt. Én eller to setninger, kun ren tekst.',
      validation: (Rule) => Rule.max(300).warning('Hold beskrivelsen kort (maks 300 tegn).'),
    },
    {
      name: 'link',
      title: 'Lenke',
      type: 'url',
      description: 'Valgfritt. Full adresse som starter med https://, for eksempel til påmelding.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'chips',
      title: 'Merkelapper',
      type: 'array',
      description: 'Valgfritt. Små fargede merker som vises på arrangementskortet.',
      of: [{ type: 'string' }],
      options: { list: CHIPS.map((c) => ({ title: c, value: c })) },
      validation: (Rule) => Rule.unique(),
    },
  ],
  orderings: [{ title: 'Dato', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'date' } },
};
