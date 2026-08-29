const TOKEN_KEY = 'jwt_token';

/**
 * Único ponto que fala com o armazenamento do navegador. Concentrar aqui evita
 * `localStorage` espalhado pelo código e deixa a troca de estratégia barata.
 */
export const tokenStorage = {
  getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  },

  save(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  },

  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};
