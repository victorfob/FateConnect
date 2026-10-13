import { useCallback } from 'react';
import { CircularProgress, iconSizeTokens, Typography } from '@design-system';
import { useQuery } from '@tanstack/react-query';

import { InAppNotificationItem } from '@app/components/InAppNotificationItem';
import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATIONS_QUERY_KEY,
} from '@app/constants/inAppNotifications';
import { useInAppNotificationActions } from '@app/hooks/useInAppNotificationActions';
import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { listInAppNotifications } from '@app/services/inAppNotifications/inAppNotificationsService';
import type { InAppNotification } from '@app/services/inAppNotifications/types';
import { FIRST_PAGE } from '@app/utils/searchParams';

import { LATEST_UNREAD_COUNT } from '../../constants';
import * as C from './constants';
import * as S from './styles';

const LATEST_UNREAD_KEY = 'latest-unread';
const NO_ITEMS = 0;

type LatestNotificationsProps = Readonly<{ onNavigate: VoidFunction }>;

/** O erro fica no painel, onde a pessoa olha: o aviso rápido sairia por trás dele. */
export function LatestNotifications({ onNavigate }: LatestNotificationsProps) {
  const { queryKey, signedIn } = useSessionQueryKey(IN_APP_NOTIFICATIONS_QUERY_KEY);
  const { openNotification, markAsRead } = useInAppNotificationActions();

  const { data, isPending, isError } = useQuery({
    queryKey: [...queryKey, LATEST_UNREAD_KEY],
    queryFn: () =>
      listInAppNotifications({ page: FIRST_PAGE, pageSize: LATEST_UNREAD_COUNT, isRead: false }),
    enabled: signedIn,
    meta: { notifiesErrorItself: true },
  });

  const handleOpen = useCallback(
    (notification: InAppNotification) => {
      onNavigate();
      openNotification(notification);
    },
    [onNavigate, openNotification],
  );

  if (isPending)
    return (
      <S.StatusArea>
        <CircularProgress size={iconSizeTokens.md} color="inherit" aria-label={C.LOADING_LABEL} />
      </S.StatusArea>
    );

  if (isError)
    return (
      <S.StatusArea role="alert">
        <S.StatusDescription variant="caption">
          {IN_APP_NOTIFICATION_TEXTS.loadFailed}
        </S.StatusDescription>
      </S.StatusArea>
    );

  if (data.items.length === NO_ITEMS)
    return (
      <S.StatusArea>
        <Typography variant="captionBold">{C.EMPTY_STATUS}</Typography>
        <S.StatusDescription variant="caption">{C.EMPTY_DESCRIPTION}</S.StatusDescription>
      </S.StatusArea>
    );

  return (
    <S.NotificationList component="ul">
      {data.items.map((notification) => (
        <S.NotificationEntry component="li" key={notification.id}>
          <InAppNotificationItem
            notification={notification}
            onOpen={handleOpen}
            onMarkAsRead={markAsRead}
          />
        </S.NotificationEntry>
      ))}
    </S.NotificationList>
  );
}
