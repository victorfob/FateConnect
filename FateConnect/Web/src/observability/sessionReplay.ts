import { replayIntegration } from '@sentry/react';

import { stripUrlQueries } from './stripUrlQueries';

const REPLAY_OPTIONS = {
  maskAllText: true,
  blockAllMedia: true,
  beforeAddRecordingEvent: stripUrlQueries,
};

/**
 * ⛔ Existe para ser alcançado **só** por `import()`. Importar `replayIntegration`
 * do barril dentro do carregador reentra no módulo que já é estático, e o
 * bundler funde tudo de volta num pedaço só.
 */
export function createSessionReplay() {
  return replayIntegration(REPLAY_OPTIONS);
}
