export const RESET_LINK_SENT_TITLE = 'Redefina sua senha';

export function resetLinkSentDescription(email: string): string {
  return `Para escolher a nova senha, abra o link enviado para ${email}.`;
}
