const SINGLE_UNREAD = 1;
const NO_UNREAD = 0;

export const TRIGGER_LABEL = 'Abrir notificações';
export const PANEL_TITLE = 'Notificações';
export const ALL_NOTIFICATIONS_LABEL = 'Conferir todas';

/** Só as não lidas: as lidas ficam na central, e o painel não passa da tela do celular. */
export const LATEST_UNREAD_COUNT = 3;

/** O número da campainha é desenho: quem usa leitor de tela o ouve pelo nome do botão. */
export function triggerLabel(unreadCount: number): string {
  if (unreadCount === NO_UNREAD) return TRIGGER_LABEL;
  if (unreadCount === SINGLE_UNREAD) return `${TRIGGER_LABEL} (1 nova)`;

  return `${TRIGGER_LABEL} (${unreadCount} novas)`;
}
