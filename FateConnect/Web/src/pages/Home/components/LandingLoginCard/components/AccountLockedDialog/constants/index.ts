export const ACCOUNT_LOCKED_DIALOG = { title: 'Conta bloqueada', closeLabel: 'Fechar' };

const LOCKOUT_REASON =
  'Por segurança, a conta foi bloqueada após várias tentativas de entrar com a senha incorreta.';
const ONE_MINUTE = 1;

function waitingTime(minutes: number): string {
  if (minutes === ONE_MINUTE) return '1 minuto';

  return `${minutes} minutos`;
}

export function lockedAccountMessage(minutesRemaining: number | undefined): string {
  if (minutesRemaining === undefined)
    return `${LOCKOUT_REASON} Para entrar, use o link enviado ao seu e-mail Fatec.`;

  return `${LOCKOUT_REASON} Para entrar, use o link enviado ao seu e-mail Fatec ou aguarde ${waitingTime(minutesRemaining)} e tente novamente.`;
}
