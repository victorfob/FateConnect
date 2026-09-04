import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  AnchoredPopover,
  InitialsAvatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  type ListItemTextProps,
} from '@design-system';
import { LogoutIcon } from '@design-system/icons';

import { logout } from '@app/services/auth/authService';
import { loggedUserName } from '@app/services/auth/loggedUser';
import { getInitials } from '@app/utils/initials';

import * as C from './constants';
import * as S from './styles';

/** Menu flutuante fala no corpo denso da escala, não no do cromo. */
const ITEM_TEXT: ListItemTextProps['slotProps'] = { primary: { variant: 'caption' } };

/**
 * Avatar de iniciais que abre o menu da conta. Sem nome no token não há
 * iniciais, e um círculo vazio diria menos que nada.
 */
export function AccountMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const userName = loggedUserName() ?? '';
  const initials = useMemo(() => getInitials(userName), [userName]);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    [],
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  if (!initials) return null;

  return (
    <>
      <S.AvatarTrigger color="inherit" label={C.TRIGGER_LABEL} onClick={handleOpen}>
        <InitialsAvatar initials={initials} label={userName} />
      </S.AvatarTrigger>

      <AnchoredPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        label={C.panelLabel(userName)}
      >
        <List>
          {C.ACCOUNT_LINKS.map(({ label, path, Icon }) => (
            <ListItemButton key={path} component={RouterLink} to={path} onClick={handleClose}>
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} slotProps={ITEM_TEXT} />
            </ListItemButton>
          ))}

          <S.MenuDivider component="li" />

          <S.SignOutItem onClick={logout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={C.SIGN_OUT_LABEL} slotProps={ITEM_TEXT} />
          </S.SignOutItem>
        </List>
      </AnchoredPopover>
    </>
  );
}
