import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FocusEvent, ReactNode, Ref } from 'react';

import type { SelectOption } from './types';

export type SelectInputProps = Readonly<{
  label: ReactNode;
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
export function SelectInput({ options, error, ref, ...selectProps }: SelectInputProps) {
  return (
    <TextField
      {...selectProps}
      select
      fullWidth
      inputRef={ref}
      error={Boolean(error)}
      helperText={error}
      // Sempre desenha a opção escolhida, então o rótulo nasce no alto.
      slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
