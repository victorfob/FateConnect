const TOKEN_KEY = 'jwt_token';
const USER_NAME_KEY = 'user_name';

/**
 * Único ponto que fala com o armazenamento do navegador. Concentrar aqui evita
 * `localStorage` espalhado pelo código e deixa a troca de estratégia barata.
 */
export const tokenStorage = {
  getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  },

  save(token: string, userName: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_NAME_KEY, userName);
  },

  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_NAME_KEY);
  },
};
