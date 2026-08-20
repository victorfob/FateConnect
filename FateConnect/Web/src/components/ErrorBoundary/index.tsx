import { Link as RouterLink } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { Button, PageMessage } from '@design-system';

import * as C from './constants';
import * as S from './styles';

/**
 * Última barreira das rotas: qualquer erro que escape de uma tela cai aqui, no
 * lugar da página de diagnóstico do roteador. A tela mostra só o que o usuário
 * consegue fazer a respeito — o rastro técnico fica com o roteador.
 */
export function ErrorBoundary() {
  return (
    <S.ErrorScreen>
      <PageMessage title={C.ERROR_TITLE} description={C.ERROR_DESCRIPTION}>
        <Button
          variant="contained"
          color="secondary"
          component={RouterLink}
          to={RoutePathEnum.LANDING}
        >
          {C.BACK_TO_START_LABEL}
        </Button>
      </PageMessage>
    </S.ErrorScreen>
  );
}
