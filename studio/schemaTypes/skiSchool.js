// Singleton (see sanity.config.js): the text on skiskole.html shared by every
// Course. While it doesn't exist, the page shows its hand-written fallback.
export const skiSchool = {
  name: 'skiSchool',
  title: 'Skiskole',
  type: 'document',
  fields: [
    { name: 'intro', title: 'Innledning', type: 'text', rows: 3, description: 'Kort tekst øverst i den felles delen.' },
    { name: 'age', title: 'Alder', type: 'string', description: 'For eksempel «4–10 år (fylte 4 år per 1. januar 2027)».' },
    {
      name: 'includes',
      title: 'Kursavgiften inkluderer',
      type: 'array',
      description: 'Ett punkt per linje.',
      of: [{ type: 'string' }],
    },
    { name: 'equipment', title: 'Utstyr', type: 'text', rows: 2 },
    { name: 'meetup', title: 'Oppmøte', type: 'text', rows: 2 },
    { name: 'reservation', title: 'Forbehold', type: 'text', rows: 2 },
  ],
  preview: { prepare: () => ({ title: 'Skiskole' }) },
};
