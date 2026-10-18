import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes/index.js';
import { projectId, dataset } from './project.js';
import { topbarMessage } from './schemaTypes/topbarMessage.js';
import { skiSchool } from './schemaTypes/skiSchool.js';
import { liftHours } from './schemaTypes/liftHours.js';
import { board } from './schemaTypes/board.js';
import { clubInfo } from './schemaTypes/clubInfo.js';

// One fixed document each, opened straight from the menu (documentId = type name).
const SINGLETONS = [topbarMessage.name, skiSchool.name, liftHours.name, board.name, clubInfo.name];
const singleton = (S, type, title) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type));

export default defineConfig({
  name: 'default',
  title: 'Drammen Slalåmklubb',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Innhold')
          .items([
            singleton(S, topbarMessage.name, 'Toppmelding'),
            singleton(S, liftHours.name, 'Heistider'),
            singleton(S, clubInfo.name, 'Klubbinfo'),
            S.documentTypeListItem('event').title('Arrangementer'),
            S.listItem()
              .title('Sponsorer')
              .schemaType('sponsor')
              .child(
                S.documentTypeList('sponsor')
                  .title('Sponsorer')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
            S.listItem()
              .title('Utvalgte innlegg')
              .schemaType('featuredPost')
              .child(
                S.documentTypeList('featuredPost')
                  .title('Utvalgte innlegg')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
            S.listItem()
              .title('Treningsgrupper')
              .schemaType('trainingGroup')
              .child(
                S.documentTypeList('trainingGroup')
                  .title('Treningsgrupper')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
            singleton(S, skiSchool.name, 'Skiskole'),
            S.listItem()
              .title('Kurs')
              .schemaType('course')
              .child(
                S.documentTypeList('course')
                  .title('Kurs')
                  .defaultOrdering([{ field: 'startDate', direction: 'asc' }]),
              ),
            singleton(S, board.name, 'Styret'),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    // Keep the singletons out of "Create new". Their templates must stay, or initialValue never applies.
    newDocumentOptions: (prev) => prev.filter((item) => !SINGLETONS.includes(item.templateId)),
    // No duplicate/delete on a singleton, so there is only ever one.
    actions: (actions, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(({ action }) => ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
});
