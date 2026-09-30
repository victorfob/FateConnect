import { PASSWORD_AUTOCOMPLETE } from '../constants';
import type { PasswordPurpose } from '../types';

const HIDDEN_TYPE = 'password';
const VISIBLE_TYPE = 'text';
/** Senha à mostra não é preenchida nem guardada pelo navegador. */
const VISIBLE_AUTOCOMPLETE = 'off';

export function passwordInputType(hidden: boolean): string {
  if (hidden) return HIDDEN_TYPE;

  return VISIBLE_TYPE;
}

export function passwordAutoComplete(hidden: boolean, purpose: PasswordPurpose): string {
  if (hidden) return PASSWORD_AUTOCOMPLETE[purpose];

  return VISIBLE_AUTOCOMPLETE;
}
