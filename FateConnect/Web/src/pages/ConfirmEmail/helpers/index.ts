import { confirmEmail } from '@app/services/auth/authService';
import { ApiError } from '@app/services/httpClient';

const FORBIDDEN = 403;

/** Conta banida antes de confirmar: o link é válido, e a API recusa a sessão. */
export function isBannedAccount(error: unknown): boolean {
  return error instanceof ApiError && error.status === FORBIDDEN;
}

export function confirmQueryFunction(token: string, onConfirmed: VoidFunction) {
  return async () => {
    const session = await confirmEmail(token);
    onConfirmed();

    return session;
  };
}
