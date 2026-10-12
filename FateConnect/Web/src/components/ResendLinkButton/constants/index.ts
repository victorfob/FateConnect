/** O mesmo intervalo da API: liberado aqui, todo clique vira e-mail de verdade. */
export const RESEND_COOLDOWN_SECONDS = 180;

const SECONDS_PER_MINUTE = 60;
const CLOCK_SECONDS_DIGITS = 2;

export const RESEND_LABEL = 'Reenviar link';
export const RESEND_FAILED_MESSAGE = 'Erro ao reenviar o link. Tente novamente.';

export function waitingLabel(secondsLeft: number): string {
  const minutes = Math.floor(secondsLeft / SECONDS_PER_MINUTE);
  const seconds = String(secondsLeft % SECONDS_PER_MINUTE).padStart(CLOCK_SECONDS_DIGITS, '0');

  return `Reenviar em ${minutes}:${seconds}`;
}
