import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './src/mocks/server';

process.env.TZ = 'America/Sao_Paulo';

// Endereços fictícios: os clientes HTTP são criados na carga do módulo, então o
// stub precisa acontecer antes de qualquer import de teste.
vi.stubEnv('VITE_API_URL', 'https://api.fateconnect.test');
vi.stubEnv('VITE_RIDE_API_URL', 'https://rides.fateconnect.test');

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
