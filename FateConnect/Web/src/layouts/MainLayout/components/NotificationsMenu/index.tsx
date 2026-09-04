import { useCallback, useState, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import { AnchoredPopover, IconButton, Typography } from '@design-system';
import { NotificationsIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import * as C from './constants';
import * as S from './styles';

export function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    [],
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <IconButton color="inherit" label={C.TRIGGER_LABEL} onClick={handleOpen}>
        <NotificationsIcon />
      </IconButton>

      <AnchoredPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        label={C.PANEL_TITLE}
      >
        <S.PanelColumn>
          <S.PanelTitle variant="subtitleBold">{C.PANEL_TITLE}</S.PanelTitle>

          <S.EmptyState>
            <Typography variant="captionBold">{C.EMPTY_STATUS}</Typography>
            <S.EmptyDescription variant="caption">{C.EMPTY_DESCRIPTION}</S.EmptyDescription>
          </S.EmptyState>

          <S.PanelFooter>
            <S.AllNotificationsLink
              component={RouterLink}
              to={RoutePathEnum.NOTIFICATIONS}
              onClick={handleClose}
            >
              {C.ALL_NOTIFICATIONS_LABEL}
            </S.AllNotificationsLink>
          </S.PanelFooter>
        </S.PanelColumn>
      </AnchoredPopover>
    </>
  );
}
