import '@testing-library/jest-dom/vitest';
import failOnConsole from 'vitest-fail-on-console';

import { server } from './src/mocks/server';

// Aviso do React no console é defeito: prop vazando para o DOM, atualização
// fora de `act`, chave repetida em lista. Sem isto o teste passa e o defeito
// só aparece no navegador de quem estiver olhando.
failOnConsole({ shouldFailOnWarn: true, shouldFailOnError: true });

process.env.TZ = 'America/Sao_Paulo';

// Endereço fictício: o cliente HTTP é criado na carga do módulo, então o
// stub precisa acontecer antes de qualquer import de teste.
vi.stubEnv('VITE_API_URL', 'https://api.fateconnect.test');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
});
afterAll(() => server.close());

// jsdom não implementa scrollIntoView; os testes que precisam observam por spy.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom não implementa scrollTo; o ScrollRestoration do roteador o chama a cada navegação.
window.scrollTo = () => {};

// jsdom não implementa `Blob.stream`, e o interceptador do msw o chama para
// montar a resposta de quem pede `responseType: 'blob'`. Sem isto, buscar a foto
// de um item explode no teste e funciona no navegador.
if (!Blob.prototype.stream) {
  Blob.prototype.stream = function stream(this: Blob) {
    const content = this.arrayBuffer();

    return new ReadableStream<Uint8Array<ArrayBuffer>>({
      async start(controller) {
        controller.enqueue(new Uint8Array(await content));
        controller.close();
      },
    });
  };
}
