import { useQuery } from '@tanstack/react-query';

import { IN_APP_NOTIFICATIONS_QUERY_KEY } from '@app/constants/inAppNotifications';
import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { getUnreadInAppNotificationCount } from '@app/services/inAppNotifications/inAppNotificationsService';

const UNREAD_COUNT_KEY = 'unread-count';
const NO_UNREAD = 0;

/**
 * Sem aviso de erro: o contador é lido em toda tela logada, e a falha só tira
 * o número da campainha, sem nada que a pessoa possa fazer.
 */
export function useUnreadInAppNotificationCount(): number {
  const { queryKey, signedIn } = useSessionQueryKey(IN_APP_NOTIFICATIONS_QUERY_KEY);

  const { data } = useQuery({
    queryKey: [...queryKey, UNREAD_COUNT_KEY],
    queryFn: getUnreadInAppNotificationCount,
    enabled: signedIn,
    meta: { notifiesErrorItself: true },
  });

  return data ?? NO_UNREAD;
}
