import { verifyResetToken } from '@app/services/auth/authService';

/** A conferência responde 204 sem corpo, e a consulta não pode devolver `undefined`. */
const VALID = true;

export function verifyQueryFunction(token: string) {
  return async () => {
    await verifyResetToken(token);

    return VALID;
  };
}
