import type { PasswordPurpose } from '../types';

export const PASSWORD_TOGGLE_LABEL = 'Mostrar ou ocultar senha';

export const PASSWORD_AUTOCOMPLETE: Readonly<Record<PasswordPurpose, string>> = {
  current: 'current-password',
  // Com `current-password` o Chrome preenche o campo ao abrir a tela, e a senha
  // pedida para confirmar uma troca chega digitada por ninguém.
  reauthentication: 'off',
  new: 'new-password',
};
