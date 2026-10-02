import type { ProfileFormInput } from '../schema';

const BROWSER_FILLED_FIELD: keyof ProfileFormInput = 'currentPassword';

/** A senha atual sozinha não é alteração: é o que o navegador preenche ao abrir a tela. */
export function hasPendingChanges(dirtyFields: object): boolean {
  return Object.keys(dirtyFields).some((field) => field !== BROWSER_FILLED_FIELD);
}
