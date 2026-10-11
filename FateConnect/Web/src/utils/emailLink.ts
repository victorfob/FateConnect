import { ApiError } from '@app/services/httpClient';

const BAD_REQUEST = 400;

/** Os links que a conta recebe por e-mail levam o token e o endereço de quem os pediu. */
export const EMAIL_LINK_TOKEN_PARAM = 'token';
export const EMAIL_LINK_EMAIL_PARAM = 'email';

/** A API não separa o link inválido do vencido e do já usado: os três são `400`. */
export function isExpiredLink(error: unknown): boolean {
  return error instanceof ApiError && error.status === BAD_REQUEST;
}
