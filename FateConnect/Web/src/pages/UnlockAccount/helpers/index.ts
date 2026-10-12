import { unlockAccount } from '@app/services/auth/authService';

/** O desbloqueio responde 204 sem corpo, e a consulta não pode devolver `undefined`. */
const UNLOCKED = true;

export function unlockQueryFunction(token: string) {
  return async () => {
    await unlockAccount(token);

    return UNLOCKED;
  };
}
