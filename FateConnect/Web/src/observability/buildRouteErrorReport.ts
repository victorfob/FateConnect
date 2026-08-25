import { isRouteErrorResponse } from 'react-router';

import { ErrorTypeEnum } from './errorTypes';
import { isErrorLike } from './isErrorLike';

export type RouteErrorReport = Readonly<{
  error: Error;
  errorType: ErrorTypeEnum;
  extra: Record<string, unknown>;
}>;

const NON_SERIALIZABLE_MESSAGE = 'Quebra na rota com erro não serializável';

/**
 * Normaliza o que o roteador devolve num evento reportável.
 *
 * ⛔ Quando o erro já é um `Error`, ele vai como veio. Criar um `Error` novo aqui
 * daria a toda quebra, de qualquer tela, os frames deste arquivo — o Sentry
 * agruparia tudo numa issue única e o rastro do defeito real desapareceria.
 */
export function buildRouteErrorReport(routeError: unknown): RouteErrorReport {
  if (isRouteErrorResponse(routeError)) {
    return {
      error: new Error(`Rota respondeu ${routeError.status} ${routeError.statusText}`),
      errorType: ErrorTypeEnum.ROUTE_ERROR_RESPONSE,
      extra: { status: routeError.status, statusText: routeError.statusText },
    };
  }

  if (isErrorLike(routeError)) {
    return { error: routeError, errorType: ErrorTypeEnum.ROUTE_BOUNDARY, extra: {} };
  }

  return {
    error: new Error(NON_SERIALIZABLE_MESSAGE),
    errorType: ErrorTypeEnum.ROUTE_BOUNDARY,
    extra: { routeError: String(routeError) },
  };
}
