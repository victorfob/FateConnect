import { replayIntegration } from '@sentry/react';

const REPLAY_OPTIONS = { maskAllText: true, blockAllMedia: true };

/**
 * ⛔ Existe para ser alcançado **só** por `import()`. Importar `replayIntegration`
 * do barril dentro do carregador reentra no módulo que já é estático, e aí o
 * bundler funde tudo de volta num pedaço só — medido: 286 kB em vez de 162.
 */
export function createSessionReplay() {
  return replayIntegration(REPLAY_OPTIONS);
}
