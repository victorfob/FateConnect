import { Link as RouterLink } from 'react-router';
import { Button } from '@design-system';

import { MessageScreen } from '@app/components/MessageScreen';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';

import * as C from './constants';

export function SessionExpiredScreen() {
  return (
    <MessageScreen title={C.SESSION_EXPIRED_TITLE} description={C.SESSION_EXPIRED_DESCRIPTION}>
      <Button
        component={RouterLink}
        to={`${RoutePathEnum.LANDING}#${LandingSectionEnum.LOGIN}`}
        variant="contained"
        color="secondary"
      >
        {C.BACK_TO_LOGIN_LABEL}
      </Button>
    </MessageScreen>
  );
}
