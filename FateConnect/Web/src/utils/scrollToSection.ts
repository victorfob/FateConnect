/**
 * Rola até a seção da landing e devolve a função de cancelamento.
 *
 * A tentativa é repetida porque o alvo pode ainda não estar posicionado no
 * momento da navegação: o rolar nativo falha quando o contêiner de scroll não é
 * a janela. Quem chama é responsável por cancelar a repetição pendente ao
 * desmontar.
 */
const RETRY_DELAY_MS = 100;

export function scrollToSection(sectionId: string): VoidFunction {
  const scroll = (): void => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  scroll();
  const retryTimer = window.setTimeout(scroll, RETRY_DELAY_MS);

  return () => window.clearTimeout(retryTimer);
}
