// The one image type in Sanity (ADR 0002). site.js shows logos in the footer
// strip, sorted by `order`.
export const sponsor = {
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Sponsorens navn. Leses opp for skjermlesere i stedet for logoen.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Helst SVG eller PNG med gjennomsiktig bakgrunn. Vises på et hvitt kort.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'url',
      title: 'Nettside',
      type: 'url',
      description: 'Valgfritt. Full adresse som starter med https://.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavest tall vises først.',
      initialValue: 10,
    },
  ],
  orderings: [{ title: 'Rekkefølge', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', media: 'logo' } },
};
