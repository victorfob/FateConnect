import { ApiError } from '@app/services/httpClient';

const FORBIDDEN = 403;
const CONTACT_REQUIRED_CODE = 'ContactRequired';

/** A recusa que a API dá a quem publica sem contato; o perfil em cache pode estar velho. */
export function isContactRequiredError(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === FORBIDDEN && error.code === CONTACT_REQUIRED_CODE
  );
}
