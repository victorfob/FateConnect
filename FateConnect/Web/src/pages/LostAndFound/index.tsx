import { Link as RouterLink } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { Button, PageMessage } from '@design-system';

import * as C from './constants';

/** Aviso de área ainda não implementada, com o caminho de volta ao menu. */
export function LostAndFound() {
  return (
    <PageMessage title={C.LOST_AND_FOUND_TITLE} description={C.LOST_AND_FOUND_DESCRIPTION}>
      <Button variant="contained" color="secondary" component={RouterLink} to={RoutePathEnum.MENU}>
        {C.BACK_TO_MENU_LABEL}
      </Button>
    </PageMessage>
  );
}
