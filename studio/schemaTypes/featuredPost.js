// The second image type in Sanity (ADR 0003). site.js shows the first six,
// sorted by `order`, as square tiles in the landing page's "Følg oss" section.
import { TikTokImageInput } from '../components/TikTokImageInput.js';

export const featuredPost = {
  name: 'featuredPost',
  title: 'Utvalgt innlegg',
  type: 'document',
  fields: [
    {
      name: 'image',
      title: 'Bilde',
      type: 'image',
      description:
        'TikTok: lim inn lenken under og trykk «Hent bilde fra TikTok». Instagram: ta skjermbilde av innlegget, last det opp og beskjær til selve bildet (eller bruk originalbildet fra den som la ut innlegget). Vises som et kvadrat: flytt fokuspunktet til det viktigste.',
      options: { hotspot: true },
      components: { input: TikTokImageInput },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'alt',
      title: 'Bildetekst for skjermlesere',
      type: 'string',
      description: 'Kort beskrivelse av hva bildet viser, f.eks. «Barn i slalåmløypa på Haukåsen».',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'link',
      title: 'Lenke til innlegget',
      type: 'url',
      description: 'Full adresse til innlegget på Instagram eller TikTok, som starter med https://.',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'order',
      title: 'Rekkefølge',
      type: 'number',
      description: 'Lavest tall vises først. Bare de seks første vises på nettsiden.',
      initialValue: 10,
    },
  ],
  orderings: [{ title: 'Rekkefølge', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'alt', media: 'image' } },
};
