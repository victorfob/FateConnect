/**
 * Valores da etiqueta `errorType` enviada ao Sentry. É o que separa, no painel,
 * quebra de renderização de resposta de rota — a segunda não é defeito de código.
 */
export enum ErrorTypeEnum {
  /** Quebra na árvore de providers, fora do roteador. */
  APP_BOUNDARY = 'AppBoundary',
  /** Quebra de renderização capturada pelo boundary de rota. */
  ROUTE_BOUNDARY = 'RouteBoundary',
  /** `Response` lançada por uma rota — 404 e afins não são quebra. */
  ROUTE_ERROR_RESPONSE = 'RouteErrorResponse',
}
