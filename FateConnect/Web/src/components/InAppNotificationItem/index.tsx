import { useCallback } from 'react';
import { HiddenField, IconButton } from '@design-system';
import { CheckIcon } from '@design-system/icons';
import { parseISO } from 'date-fns';

import {
  IN_APP_NOTIFICATION_ICONS,
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATION_TITLES,
} from '@app/constants/inAppNotifications';
import type { InAppNotification } from '@app/services/inAppNotifications/types';
import { relativeTime } from '@app/utils/relativeTime';

import * as C from './constants';
import * as S from './styles';

export type InAppNotificationItemProps = Readonly<{
  notification: InAppNotification;
  onOpen: (notification: InAppNotification) => void;
  onMarkAsRead: (notification: InAppNotification) => void;
}>;

export function InAppNotificationItem({
  notification,
  onOpen,
  onMarkAsRead,
}: InAppNotificationItemProps) {
  const { type, content, isRead, createdAt } = notification;
  const TypeIcon = IN_APP_NOTIFICATION_ICONS[type];

  const handleOpen = useCallback(() => onOpen(notification), [notification, onOpen]);
  const handleMarkAsRead = useCallback(
    () => onMarkAsRead(notification),
    [notification, onMarkAsRead],
  );

  return (
    <S.ItemRow>
      <S.OpenArea focusRipple onClick={handleOpen}>
        <S.TypeIcon component="span" read={isRead} aria-hidden="true">
          <TypeIcon />
        </S.TypeIcon>

        <S.TextColumn component="span">
          {!isRead && (
            <HiddenField component="span">{IN_APP_NOTIFICATION_TEXTS.unread}</HiddenField>
          )}
          <S.ItemText component="span" variant="subtitleBold" read={isRead}>
            {IN_APP_NOTIFICATION_TITLES[type]}
          </S.ItemText>
          <S.ItemText
            component="span"
            variant="caption"
            read={isRead}
            {...{ [C.CONTENT_ATTRIBUTE]: '' }}
          >
            {content}
          </S.ItemText>
          <S.Time component="time" variant="caption" dateTime={createdAt}>
            {relativeTime(parseISO(createdAt))}
          </S.Time>
        </S.TextColumn>
      </S.OpenArea>

      {!isRead && (
        <IconButton
          size="small"
          label={IN_APP_NOTIFICATION_TEXTS.markAsRead}
          onClick={handleMarkAsRead}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      )}
    </S.ItemRow>
  );
}
