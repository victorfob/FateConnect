import { ListItemButton, ListItemIcon, ListItemText } from '@design-system';
import { LogoutIcon } from '@design-system/icons';

import { logout } from '@app/services/auth/authService';

import { SIGN_OUT_LABEL } from './constants';

export function DrawerSignOut() {
  return (
    <ListItemButton onClick={logout}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={SIGN_OUT_LABEL} />
    </ListItemButton>
  );
}
