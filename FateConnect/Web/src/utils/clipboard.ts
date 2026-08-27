/**
 * Copia um texto para a área de transferência.
 *
 * A API do navegador só existe em contexto seguro — `https` ou `localhost` — e
 * ainda pode ser negada por permissão. Em vez de estourar, devolve se a cópia
 * aconteceu: quem chama avisa o usuário sem precisar conhecer o motivo.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}
