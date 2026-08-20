/**
 * Registra o que escapa do React.
 *
 * O `ErrorBoundary` da rota cobre erro durante o render. Erro lançado em
 * ouvinte de evento e promessa rejeitada sem `catch` não passam por ele: sem
 * estes dois ouvintes eles desaparecem sem rastro. É o papel que o
 * `provideBrowserGlobalErrorListeners` cumpre no produto.
 *
 * Registra no console de propósito, e não como aviso na tela: um erro pode vir
 * de recurso de terceiro e virar uma fila de avisos que o usuário não resolve.
 */
export function reportUncaughtErrors(): void {
  window.addEventListener('error', (event) => {
    console.error('Erro não capturado:', event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promessa rejeitada sem tratamento:', event.reason);
  });
}
