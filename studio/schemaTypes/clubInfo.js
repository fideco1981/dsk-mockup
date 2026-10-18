// Singleton (see sanity.config.js): the club's addresses, social links, Spond
// signup link, membership pitch and contact persons, shown in the footer, on
// kontakt.html and on the landing page. While it doesn't exist, or a field is
// empty, the pages show their hand-written fallback (except social links:
// an empty one hides that button).
import { contactDetailsFields } from './contactDetails.js';

const url = (name, title, description) => ({
  name,
  title,
  type: 'url',
  description,
  validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
});

export const clubInfo = {
  name: 'clubInfo',
  title: 'Klubbinfo',
  type: 'document',
  fields: [
    { name: 'visitAddress', title: 'Besøksadresse', type: 'string', description: 'For eksempel «Blektjernveien 18». Vises i bunnteksten og på Kontakt.' },
    { name: 'postAddress', title: 'Postadresse', type: 'string', description: 'For eksempel «Postboks 2404, 3003 Drammen».' },
    { name: 'orgNumber', title: 'Organisasjonsnummer', type: 'string', description: 'Vises på Kontakt.' },
    url('instagram', 'Instagram', 'Full adresse til klubbens Instagram-profil. La stå tomt for å skjule Instagram-knappen overalt.'),
    url('facebook', 'Facebook', 'Full adresse til klubbens Facebook-side. La stå tomt for å skjule Facebook-knappen overalt.'),
    url('tiktok', 'TikTok', 'Full adresse til klubbens TikTok-profil. La stå tomt for å skjule TikTok-knappen overalt.'),
    url('spondSignup', 'Innmelding i Spond', 'Lenken alle «Bli Medlem»- og «Meld deg inn»-knappene går til. Kurslenken i Spond ligger på hvert kurs.'),
    {
      name: 'membershipText',
      title: 'Medlemskap: tekst',
      type: 'text',
      rows: 3,
      description: 'Avsnittet under «Bli en del av klubben» på forsiden.',
    },
    {
      name: 'membershipPoints',
      title: 'Medlemskap: punkter',
      type: 'array',
      description: 'Korte punkter under «Meld deg inn nå»-knappen, for eksempel «Første time gratis for barn 5–10 år». Ett punkt per linje.',
      of: [{ type: 'string' }],
    },
    {
      name: 'contactPersons',
      title: 'Kontaktpersoner',
      type: 'array',
      description: 'Vises på Kontakt i denne rekkefølgen (dra for å endre).',
      of: [
        {
          type: 'object',
          name: 'contactPerson',
          title: 'Kontaktperson',
          fields: [
            { name: 'name', title: 'Navn', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'role',
              title: 'Rolle',
              type: 'string',
              description: 'For eksempel «Foreldrekontakt · U12–U14». Ikke skriv telefonnummer eller e-post her; bruk feltene under, som bare vises med samtykke.',
              validation: (Rule) => Rule.required(),
            },
            ...contactDetailsFields,
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Klubbinfo' }) },
};
