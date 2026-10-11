import { ApiError } from '@app/services/httpClient';

const BAD_REQUEST = 400;

/** A API não separa o link inválido do vencido e do já usado: os três são `400`. */
export function isExpiredLink(error: unknown): boolean {
  return error instanceof ApiError && error.status === BAD_REQUEST;
}
