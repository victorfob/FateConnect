import { useCallback, useState, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { AnchoredPopover, Badge, IconButton } from '@design-system';
import { NotificationsIcon } from '@design-system/icons';

import { IN_APP_NOTIFICATION_TEXTS } from '@app/constants/inAppNotifications';
import { useInAppNotificationActions } from '@app/hooks/useInAppNotificationActions';
import { useUnreadInAppNotificationCount } from '@app/hooks/useUnreadInAppNotificationCount';
import { RoutePathEnum } from '@app/routes/paths';

import { LatestNotifications } from './components/LatestNotifications';
import * as C from './constants';
import * as S from './styles';

const NO_UNREAD = 0;

export function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const unreadCount = useUnreadInAppNotificationCount();
  const { markAllAsRead, isMarkingAll } = useInAppNotificationActions();

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    [],
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <IconButton
        color="inherit"
        size="large"
        label={C.triggerLabel(unreadCount)}
        onClick={handleOpen}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <AnchoredPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        label={C.PANEL_TITLE}
      >
        <S.PanelColumn>
          <S.PanelHeader>
            <S.PanelTitle variant="subtitleBold">{C.PANEL_TITLE}</S.PanelTitle>

            {unreadCount > NO_UNREAD && (
              <S.BrandTextButton size="small" loading={isMarkingAll} onClick={markAllAsRead}>
                {IN_APP_NOTIFICATION_TEXTS.markAllAsRead}
              </S.BrandTextButton>
            )}
          </S.PanelHeader>

          <LatestNotifications onNavigate={handleClose} />

          <S.PanelFooter>
            <S.BrandTextButton
              component={RouterLink}
              to={RoutePathEnum.NOTIFICATIONS}
              onClick={handleClose}
            >
              {C.ALL_NOTIFICATIONS_LABEL}
            </S.BrandTextButton>
          </S.PanelFooter>
        </S.PanelColumn>
      </AnchoredPopover>
    </>
  );
}
