import type { PasswordPurpose } from '../types';

export const PASSWORD_TOGGLE_LABEL = 'Mostrar ou ocultar senha';

export const PASSWORD_AUTOCOMPLETE: Readonly<Record<PasswordPurpose, string>> = {
  current: 'current-password',
  new: 'new-password',
};
