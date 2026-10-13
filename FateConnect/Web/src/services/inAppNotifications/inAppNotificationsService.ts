import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import type { InAppNotification, InAppNotificationFilter } from './types';

const IN_APP_NOTIFICATIONS_PATH = '/inappnotifications';

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de notificações respondeu algo que não é uma página.';
const INVALID_COUNT_PAYLOAD_MESSAGE = 'A API de notificações respondeu algo que não é um número.';

export async function listInAppNotifications(
  filters?: InAppNotificationFilter,
): Promise<PagedResult<InAppNotification>> {
  const { data } = await apiClient.get<PagedResult<InAppNotification>>(IN_APP_NOTIFICATIONS_PATH, {
    params: filters,
  });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function getUnreadInAppNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<number>(`${IN_APP_NOTIFICATIONS_PATH}/unread-count`);

  if (typeof data !== 'number') throw new Error(INVALID_COUNT_PAYLOAD_MESSAGE);

  return data;
}

export async function markInAppNotificationAsRead(notificationId: number): Promise<void> {
  await apiClient.patch(`${IN_APP_NOTIFICATIONS_PATH}/${notificationId}/read`);
}

export async function markAllInAppNotificationsAsRead(): Promise<void> {
  await apiClient.patch(`${IN_APP_NOTIFICATIONS_PATH}/read-all`);
}
