import { useEffect } from 'react';
import { Link as RouterLink, useLocation, useRouteError } from 'react-router';

import { CrashScreen } from '@app/components/CrashScreen';
import { BACK_TO_START_LABEL } from '@app/components/CrashScreen/constants';
import { buildRouteErrorReport, captureException } from '@app/observability';
import { RoutePathEnum } from '@app/routes/paths';
import { Button } from '@design-system';

/**
 * Última barreira das rotas: qualquer erro que escape de uma tela cai aqui, no
 * lugar da página de diagnóstico do roteador. A tela mostra só o que o usuário
 * consegue fazer a respeito — o rastro técnico vai para o Sentry.
 *
 * O relato acontece aqui porque erro de renderização não chega ao
 * `window.onerror`: o React o entrega ao boundary, e sem este efeito a tela que
 * quebrou seria justamente a que ninguém ficaria sabendo.
 */
export function ErrorBoundary() {
  const routeError = useRouteError();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!routeError) return;

    const { error, errorType, extra } = buildRouteErrorReport(routeError);

    captureException(error, {
      tags: { errorType, route: pathname },
      extra,
    });
  }, [pathname, routeError]);

  return (
    <CrashScreen>
      <Button
        variant="contained"
        color="secondary"
        component={RouterLink}
        to={RoutePathEnum.LANDING}
      >
        {BACK_TO_START_LABEL}
      </Button>
    </CrashScreen>
  );
}
