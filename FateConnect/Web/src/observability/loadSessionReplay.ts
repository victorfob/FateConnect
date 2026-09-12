import { getClient } from '@sentry/react';

async function loadSessionReplay(): Promise<void> {
  const client = getClient();
  if (!client) return;

  const { createSessionReplay } = await import('./sessionReplay');

  client.addIntegration(createSessionReplay());
}

function handleWindowLoad(): void {
  void loadSessionReplay();
}

/**
 * ⛔ O replay responde por 40 kB gzip do pacote, e nada do que ele grava depende
 * de ele estar de pé na primeira pintura. Carregá-lo depois tira esse peso do
 * caminho crítico sem mudar o que é coletado.
 */
export function scheduleSessionReplay(): void {
  if (document.readyState === 'complete') {
    void loadSessionReplay();
    return;
  }

  window.addEventListener('load', handleWindowLoad, { once: true });
}
