export const topbarMessage = {
  name: 'topbarMessage',
  title: 'Toppmelding',
  type: 'document',
  fields: [
    {
      name: 'messages',
      title: 'Meldinger',
      type: 'array',
      description: 'Vises øverst på alle sider. Flere meldinger veksler hvert 5. sekund, i denne rekkefølgen (dra for å endre).',
      of: [
        {
          type: 'object',
          name: 'message',
          title: 'Melding',
          fields: [
            {
              name: 'text',
              title: 'Tekst',
              type: 'string',
              description: 'Kort beskjed, én linje.',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'link',
              title: 'Lenke',
              type: 'url',
              description: 'Valgfritt. Full adresse som starter med https://.',
              validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
            },
          ],
          preview: { select: { title: 'text', subtitle: 'link' } },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'show',
      title: 'Vis meldingene',
      type: 'boolean',
      description: 'Slå av for å skjule toppfeltet uten å slette meldingene.',
      initialValue: true,
    },
  ],
  preview: { select: { title: 'messages.0.text' } },
};
