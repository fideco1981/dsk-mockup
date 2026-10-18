// Phone, email and consent for a person (Board member, Contact person, Trainer). The
// dataset is public, so Studio refuses to publish details without a ticked and
// dated consent (ADR 0004). site.js isPhone uses the same phone regex; keep them together.
const needsConsent = (parent) => Boolean(parent?.phone || parent?.email);

export const contactDetailsFields = [
  {
    name: 'phone',
    title: 'Telefon',
    type: 'string',
    description: 'Valgfritt. For eksempel «+47 912 34 567». Vises bare med samtykke.',
    validation: (Rule) =>
      Rule.regex(/^\+?\d[\d ]{6,18}\d$/, { name: 'telefonnummer' }).error('Bare sifre og mellomrom, eventuelt med + først.'),
  },
  {
    name: 'email',
    title: 'E-post',
    type: 'email',
    description: 'Valgfritt. Vises bare med samtykke.',
  },
  {
    name: 'consent',
    title: 'Samtykker til publisering av telefon og e-post',
    type: 'boolean',
    description:
      'Kryss av bare når personen har samtykket. Selve samtykket (skjema, e-post) oppbevarer klubben utenfor nettsiden. ' +
      'Trekker personen samtykket: tøm telefon og e-post, fjern krysset og publiser.',
    validation: (Rule) =>
      Rule.custom((consent, { parent }) =>
        !needsConsent(parent) || consent === true ? true : 'Telefon eller e-post kan bare publiseres med samtykke. Kryss av, eller tøm feltene.',
      ),
  },
  {
    name: 'consentDate',
    title: 'Samtykkedato',
    type: 'date',
    description: 'Datoen personen samtykket.',
    options: { dateFormat: 'DD.MM.YYYY' },
    validation: (Rule) =>
      Rule.custom((date, { parent }) => (!needsConsent(parent) || date ? true : 'Fyll inn datoen for samtykket.')),
  },
];
