import { setupServer } from 'msw/node';

/** Servidor de mocks compartilhado. Cada teste registra os handlers de que precisa. */
export const server = setupServer();
