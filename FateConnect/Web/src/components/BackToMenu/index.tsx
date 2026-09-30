import { NavLink } from 'react-router';
import { PageShell } from '@design-system';
import { ArrowBackIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import { BACK_TO_MENU_LABEL } from './constants';

export function BackToMenu() {
  return (
    <PageShell.Back
      label={BACK_TO_MENU_LABEL}
      icon={<ArrowBackIcon fontSize="small" />}
      component={NavLink}
      to={RoutePathEnum.MENU}
    />
  );
}
