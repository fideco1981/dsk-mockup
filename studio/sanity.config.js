import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes/index.js';
import { projectId, dataset } from './project.js';
import { topbarMessage } from './schemaTypes/topbarMessage.js';

const SINGLETON = topbarMessage.name;

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
            S.listItem()
              .title('Toppmelding')
              .id(SINGLETON)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
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
              .title('Treningsgrupper')
              .schemaType('trainingGroup')
              .child(
                S.documentTypeList('trainingGroup')
                  .title('Treningsgrupper')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    // Keep the singleton out of "Create new". Its template must stay, or initialValue never applies.
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== SINGLETON),
    // No duplicate/delete on the singleton, so there is only ever one.
    actions: (actions, { schemaType }) =>
      schemaType === SINGLETON
        ? actions.filter(({ action }) => ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
});
