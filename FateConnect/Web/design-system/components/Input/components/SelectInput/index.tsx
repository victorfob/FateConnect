import type { ChangeEvent, FocusEvent, Ref } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { InputHelpButton } from '@ds-root/components/Input/components/InputHelpButton';

import type { SelectOption } from './types';

export type SelectInputProps = Readonly<{
  label: string;
  /** Explicação do campo, atrás de um ícone de ajuda no fim do campo. */
  helpText?: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  /** A presença da mensagem **é** o estado de erro do campo. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  ref?: Ref<HTMLInputElement>;
}>;

/**
 * Controlada de propósito: o `select` do MUI guarda o texto exibido em estado
 * próprio, e um campo não controlado ficaria vazio ao ser preenchido de fora.
 */
export function SelectInput({ options, helpText, error, ref, ...selectProps }: SelectInputProps) {
  return (
    <TextField
      {...selectProps}
      select
      fullWidth
      inputRef={ref}
      error={Boolean(error)}
      helperText={error}
      // Sempre desenha a opção escolhida, então o rótulo nasce no alto.
      slotProps={{
        select: { displayEmpty: true },
        inputLabel: { shrink: true },
        input: {
          endAdornment: helpText ? (
            <InputAdornment position="end">
              <InputHelpButton fieldLabel={selectProps.label} helpText={helpText} />
            </InputAdornment>
          ) : null,
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
