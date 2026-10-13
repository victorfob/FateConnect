import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATIONS_QUERY_KEY,
} from '@app/constants/inAppNotifications';
import { useNotification } from '@app/hooks/useNotification';
import { RoutePathEnum } from '@app/routes/paths';
import { ApiError } from '@app/services/httpClient';
import {
  markAllInAppNotificationsAsRead,
  markInAppNotificationAsRead,
} from '@app/services/inAppNotifications/inAppNotificationsService';
import {
  InAppNotificationTypeEnum,
  type InAppNotification,
} from '@app/services/inAppNotifications/types';
import { getRide } from '@app/services/rides/ridesService';
import { archivedItemsPath, rideSearchPath } from '@app/utils/inAppNotificationDestination';

const NOT_FOUND = 404;

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

  // `null` é a carona que já não existe: a pessoa fica onde está.
  const { mutate: goToDestination } = useMutation({
    mutationFn: async ({ type, referenceId }: InAppNotification): Promise<string | null> => {
      if (type === InAppNotificationTypeEnum.REPORT_RECEIVED) return RoutePathEnum.REPORTS;
      if (type === InAppNotificationTypeEnum.ITEM_ARCHIVED) return archivedItemsPath();
      if (!referenceId) return RoutePathEnum.RIDES;

      try {
        const ride = await getRide(referenceId);

        return rideSearchPath(ride.destination);
      } catch (error) {
        if (error instanceof ApiError && error.status === NOT_FOUND) return null;

        throw error;
      }
    },
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
