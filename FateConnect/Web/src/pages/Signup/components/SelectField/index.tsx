import { Controller, useFormContext } from 'react-hook-form';

import { MenuItem, TextField } from '@design-system';

import { SELECT_PLACEHOLDER } from '../../constants';
import type { SignupFormValues } from '../../schema';
import type { SelectOption } from '../../@types';

type SelectFieldName = Extract<keyof SignupFormValues, 'gender' | 'state'>;

type SelectFieldProps = {
  name: SelectFieldName;
  label: string;
  options: readonly SelectOption[];
  autoComplete: string;
  required?: boolean;
};

/**
 * Campo de seleção ligado ao formulário por `Controller`. O `select` do MUI
 * guarda o texto exibido em estado próprio: registrado como campo não
 * controlado, ele continuaria vazio quando o CEP preenchesse o estado.
 */
export function SelectField({ name, label, options, autoComplete, required }: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label={label}
          required={required}
          fullWidth
          autoComplete={autoComplete}
          error={Boolean(error)}
          helperText={error?.message}
          // Sem escolha, o campo mostra "Selecione..." e o rótulo já fica no
          // alto — o mesmo que o campo do produto faz com o seu placeholder.
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">{SELECT_PLACEHOLDER}</MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
