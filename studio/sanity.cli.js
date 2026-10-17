import { defineCliConfig } from 'sanity/cli';
import { projectId, dataset } from './project.js';

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: { appId: 'qyd2oggziv3onglu3ur7hhli' }, // https://dsk-slalom.sanity.studio
});
