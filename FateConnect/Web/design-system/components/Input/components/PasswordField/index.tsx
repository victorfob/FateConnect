import { useCallback, useState } from 'react';

import { IconButton } from '@ds-root/components/IconButton';
import { InputField, type InputProps } from '@ds-root/components/Input/InputField';
import { VisibilityIcon, VisibilityOffIcon } from '@ds-root/icons';

import { PASSWORD_TOGGLE_LABEL } from './constants';
import { passwordAutoComplete, passwordInputType } from './helpers';
import type { PasswordPurpose } from './types';

export type PasswordFieldProps = Readonly<
  Omit<InputProps, 'type' | 'autoComplete' | 'endAdornment' | 'maxLength' | 'characterCount'> & {
    /**
     * Diz ao navegador se ele preenche a senha guardada (`current`), se espera a
     * pessoa digitá-la (`reauthentication`) ou se sugere uma nova (`new`).
     */
    purpose: PasswordPurpose;
  }
>;

export function PasswordField({ purpose, ...inputProps }: PasswordFieldProps) {
  const [hidden, setHidden] = useState(true);

  const handleToggle = useCallback(() => setHidden((wasHidden) => !wasHidden), []);

  return (
    <InputField
      {...inputProps}
      type={passwordInputType(hidden)}
      autoComplete={passwordAutoComplete(hidden, purpose)}
      endAdornment={
        <IconButton
          type="button"
          size="large"
          label={PASSWORD_TOGGLE_LABEL}
          aria-pressed={!hidden}
          onClick={handleToggle}
        >
          {/* O ícone mostra o estado atual: olho aberto é senha visível. */}
          {hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      }
    />
  );
}
