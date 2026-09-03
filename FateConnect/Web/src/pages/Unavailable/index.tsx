import { Link as RouterLink } from 'react-router';
import { Button, PageMessage } from '@design-system';

import { RoutePathEnum } from '@app/routes/paths';

import * as C from './constants';

export type UnavailableProps = Readonly<{ description: string }>;

/** As três rotas sem dono mostram esta tela; só a descrição muda. */
export function Unavailable({ description }: UnavailableProps) {
  return (
    <PageMessage title={C.UNAVAILABLE_TITLE} description={description}>
      <Button component={RouterLink} to={RoutePathEnum.MENU} variant="contained" color="secondary">
        {C.BACK_TO_MENU_LABEL}
      </Button>
    </PageMessage>
  );
}
