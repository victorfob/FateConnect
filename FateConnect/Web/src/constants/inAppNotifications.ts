import {
  DirectionsCarIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system/icons';

import { InAppNotificationTypeEnum } from '@app/services/inAppNotifications/types';

/** Raiz das chaves do contador e das listas: invalidá-la relê tudo de uma vez. */
export const IN_APP_NOTIFICATIONS_QUERY_KEY = 'inAppNotifications';

export const IN_APP_NOTIFICATION_ICONS: Readonly<
  Record<InAppNotificationTypeEnum, SvgIconComponent>
> = {
  [InAppNotificationTypeEnum.REPORT_RECEIVED]: SecurityIcon,
  [InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD]: DirectionsCarIcon,
  [InAppNotificationTypeEnum.ITEM_ARCHIVED]: SearchIcon,
};

export const IN_APP_NOTIFICATION_TITLES: Readonly<Record<InAppNotificationTypeEnum, string>> = {
  [InAppNotificationTypeEnum.REPORT_RECEIVED]: 'Denúncia recebida',
  [InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD]: 'Carona ofertada',
  [InAppNotificationTypeEnum.ITEM_ARCHIVED]: 'Item arquivado',
};

export const IN_APP_NOTIFICATION_TEXTS = {
  markAsRead: 'Marcar como lida',
  markAllAsRead: 'Marcar todas como lidas',
  unread: 'Não lida',
  rideRemoved: 'A carona deste aviso foi excluída.',
  loadFailed: 'Erro ao carregar as notificações. Tente novamente.',
  markFailed: 'Erro ao marcar como lida. Tente novamente.',
  markAllFailed: 'Erro ao marcar as notificações como lidas. Tente novamente.',
  openFailed: 'Erro ao abrir a notificação. Tente novamente.',
};
