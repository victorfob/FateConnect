const DISMISSED_FOR_KEY = 'contact_banner_dismissed_for';
const TOKEN_SEGMENT_SEPARATOR = '.';

/** A assinatura muda a cada login: guardá-la é o que faz a faixa voltar no próximo. */
function sessionMarkOf(token: string | null): string | null {
  if (!token) return null;

  return token.slice(token.lastIndexOf(TOKEN_SEGMENT_SEPARATOR) + TOKEN_SEGMENT_SEPARATOR.length);
}

/** Único ponto que fala com o armazenamento do navegador sobre a faixa de contato. */
export const contactBannerStorage = {
  isDismissedFor(token: string | null): boolean {
    const mark = sessionMarkOf(token);
    if (!mark) return false;

    return window.localStorage.getItem(DISMISSED_FOR_KEY) === mark;
  },

  dismissFor(token: string | null): void {
    const mark = sessionMarkOf(token);
    if (!mark) return;

    window.localStorage.setItem(DISMISSED_FOR_KEY, mark);
  },
};
