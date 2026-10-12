export const CHECK_EMAIL_TITLE = 'Confirme seu e-mail';

export function checkEmailDescription(email: string): string {
  return `Para entrar, abra o link de confirmação enviado para ${email}.`;
}
