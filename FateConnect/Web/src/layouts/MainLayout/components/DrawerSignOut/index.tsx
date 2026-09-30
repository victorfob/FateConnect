import { ListItemButton, ListItemIcon, ListItemText } from '@design-system';
import { LogoutIcon } from '@design-system/icons';

import { useSignOut } from '@app/hooks/useSignOut';

import { SIGN_OUT_LABEL } from './constants';

export function DrawerSignOut() {
  const signOut = useSignOut();

  return (
    <ListItemButton onClick={signOut}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={SIGN_OUT_LABEL} />
    </ListItemButton>
  );
}
