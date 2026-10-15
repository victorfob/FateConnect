import type { SelectOption } from '@design-system';

import { NOTIFICATION_TYPE_OPTIONS } from '@app/pages/Notifications/helpers/notificationType';

export const FILTER_LABELS = { status: 'Situação', type: 'Tipo' };

/** Só `UNREAD` vai para a requisição, como `isRead: false`. */
export enum NotificationStatusFilterEnum {
  ALL = '',
  UNREAD = 'unread',
}

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum NotificationTypeFilterEnum {
  ALL = '',
}

export const NOTIFICATION_STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: NotificationStatusFilterEnum.ALL, label: 'Todas' },
  { value: NotificationStatusFilterEnum.UNREAD, label: 'Não lidas' },
];

export const NOTIFICATION_TYPE_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: NotificationTypeFilterEnum.ALL, label: 'Todos' },
  ...NOTIFICATION_TYPE_OPTIONS,
];
