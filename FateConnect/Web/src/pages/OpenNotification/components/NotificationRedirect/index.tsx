import { Navigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATIONS_QUERY_KEY,
} from '@app/constants/inAppNotifications';
import { useNotification } from '@app/hooks/useNotification';
import { RoutePathEnum } from '@app/routes/paths';
import { markInAppNotificationAsRead } from '@app/services/inAppNotifications/inAppNotificationsService';
import { notificationDestination } from '@app/utils/inAppNotificationDestination';

import type { PushedNotification } from '../../@types';
import { OPEN_NOTIFICATION_QUERY_KEY } from '../../constants';

type NotificationRedirectProps = Readonly<{ notification: PushedNotification }>;

/** O aviso pode ser da conta que usava o aparelho antes: a marcação recusada não segura o destino. */
async function markAsReadIfOwn(notificationId: number): Promise<void> {
  try {
    await markInAppNotificationAsRead(notificationId);
  } catch {
    // O destino segue valendo para quem entrou.
  }
}

export function NotificationRedirect({ notification }: NotificationRedirectProps) {
  const queryClient = useQueryClient();
  const { notifyWarning } = useNotification();

  const { data: destination, isError } = useQuery({
    queryKey: [OPEN_NOTIFICATION_QUERY_KEY, notification.id],
    queryFn: async () => {
      const [path] = await Promise.all([
        notificationDestination(notification),
        markAsReadIfOwn(notification.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: [IN_APP_NOTIFICATIONS_QUERY_KEY] });

      if (path) return path;

      notifyWarning(IN_APP_NOTIFICATION_TEXTS.rideRemoved);
      return RoutePathEnum.NOTIFICATIONS;
    },
    retry: false,
    gcTime: 0,
    meta: { errorMessage: IN_APP_NOTIFICATION_TEXTS.openFailed },
  });

  if (isError) return <Navigate to={RoutePathEnum.NOTIFICATIONS} replace />;
  if (!destination) return null;

  return <Navigate to={destination} replace />;
}
