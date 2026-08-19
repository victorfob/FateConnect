/**
 * Rola até a seção da landing.
 *
 * A tentativa é repetida porque o alvo pode ainda não estar posicionado no
 * momento da navegação — comportamento herdado do front Angular, onde o scroll
 * nativo falhava quando o container de scroll não era a janela.
 */
const RETRY_DELAY_MS = 100;

export function scrollToSection(sectionId: string): void {
  const scroll = (): void => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  scroll();
  window.setTimeout(scroll, RETRY_DELAY_MS);
}
