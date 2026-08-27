import type { FocusEvent, ReactNode } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { DatePickerButton } from '@ds-root/components/Input/components/DatePickerButton';

export type DateInputProps = Readonly<{
  label: ReactNode;
  value: Date | null;
  onChange: (value: Date | null) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  /** A presença da mensagem **é** o estado de erro do campo. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Limite superior do seletor; o dia do limite continua escolhível. */
  maxDate?: Date;
}>;

/** O rótulo não nasce no alto: o seletor esconde as seções até o foco. */
export function DateInput({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  required,
  disabled,
  maxDate,
}: DateInputProps) {
  return (
    <DatePicker
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxDate={maxDate}
      slots={{ openPickerButton: DatePickerButton }}
      slotProps={{
        textField: {
          required,
          fullWidth: true,
          onBlur,
          error: Boolean(error),
          helperText: error,
        },
      }}
    />
  );
}
