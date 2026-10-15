import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATIONS_QUERY_KEY,
} from '@app/constants/inAppNotifications';
import { useNotification } from '@app/hooks/useNotification';
import {
  markAllInAppNotificationsAsRead,
  markInAppNotificationAsRead,
} from '@app/services/inAppNotifications/inAppNotificationsService';
import type { InAppNotification } from '@app/services/inAppNotifications/types';
import { notificationDestination } from '@app/utils/inAppNotificationDestination';

type InAppNotificationActions = {
  openNotification: (notification: InAppNotification) => void;
  markAsRead: (notification: InAppNotification) => void;
  markAllAsRead: VoidFunction;
  isMarkingAll: boolean;
};

export function useInAppNotificationActions(): InAppNotificationActions {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notifyWarning } = useNotification();

  const invalidateNotifications = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [IN_APP_NOTIFICATIONS_QUERY_KEY] }),
    [queryClient],
  );

  const { mutate: markAsRead } = useMutation({
    mutationFn: (notification: InAppNotification) => markInAppNotificationAsRead(notification.id),
    onSuccess: invalidateNotifications,
    meta: { errorMessage: IN_APP_NOTIFICATION_TEXTS.markFailed },
  });

  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllInAppNotificationsAsRead,
    onSuccess: invalidateNotifications,
    meta: { errorMessage: IN_APP_NOTIFICATION_TEXTS.markAllFailed },
  });

  // Sem destino, a carona já não existe: a pessoa fica onde está.
  const { mutate: goToDestination } = useMutation({
    mutationFn: notificationDestination,
    onSuccess: (path) => {
      if (path) {
        void navigate(path);
        return;
      }

      notifyWarning(IN_APP_NOTIFICATION_TEXTS.rideRemoved);
    },
    meta: { errorMessage: IN_APP_NOTIFICATION_TEXTS.openFailed },
  });

  const openNotification = useCallback(
    (notification: InAppNotification) => {
      if (!notification.isRead) markAsRead(notification);

      goToDestination(notification);
    },
    [goToDestination, markAsRead],
  );

  // Sem repassar argumento: ligado direto a um clique, o evento viraria a variável da mutação.
  const markAllAsRead = useCallback(() => markAll(), [markAll]);

  return { openNotification, markAsRead, markAllAsRead, isMarkingAll };
}
