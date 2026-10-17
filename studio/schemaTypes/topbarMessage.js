export const topbarMessage = {
  name: 'topbarMessage',
  title: 'Toppmelding',
  type: 'document',
  fields: [
    {
      name: 'text',
      title: 'Tekst',
      type: 'string',
      description: 'Kort beskjed som vises øverst på alle sider.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'link',
      title: 'Lenke',
      type: 'url',
      description: 'Valgfritt. Full adresse som starter med https://.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'show',
      title: 'Vis meldingen',
      type: 'boolean',
      description: 'Slå av for å skjule meldingen uten å slette teksten.',
      initialValue: true,
    },
  ],
  preview: { select: { title: 'text' } },
};
