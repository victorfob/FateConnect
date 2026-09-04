const TOKEN_KEY = 'jwt_token';

const listeners = new Set<VoidFunction>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

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
    notify();
  },

  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
    notify();
  },

  /**
   * O `localStorage` não avisa quem o lê. Sem esta assinatura, quem decide pela
   * presença do token — o guard de rota — não re-renderiza quando a sessão sai,
   * e a pessoa continua na tela em que estava depois de encerrá-la.
   */
  subscribe(listener: VoidFunction): VoidFunction {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
