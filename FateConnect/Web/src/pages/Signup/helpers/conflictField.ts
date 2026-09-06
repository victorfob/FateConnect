import type { ApiError } from '@app/services/httpClient';

import { SignupConflictFieldEnum } from '../@types';

const CONFLICT = 409;

const CONFLICT_FIELDS: ReadonlySet<string> = new Set(Object.values(SignupConflictFieldEnum));

function isConflictField(value: string): value is SignupConflictFieldEnum {
  return CONFLICT_FIELDS.has(value);
}

/**
 * `null` cobre o 409 sem campo reconhecido — é o que a API responde antes de
 * publicar a versão que nomeia o campo, e aí o aviso solto ainda vale.
 */
export function conflictFieldOf(error: ApiError): SignupConflictFieldEnum | null {
  if (error.status !== CONFLICT) return null;
  if (!error.field) return null;
  if (!isConflictField(error.field)) return null;

  return error.field;
}
