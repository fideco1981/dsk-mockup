import { TIME } from './event.js';

// A weekly session {day, from, to}, shared by Training group and Course.
export const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
const timeRule = (Rule) =>
  Rule.required().regex(TIME, { name: 'klokkeslett' }).error('Skriv klokkeslettet som TT:MM, for eksempel 18:00.');

export const session = {
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
};
