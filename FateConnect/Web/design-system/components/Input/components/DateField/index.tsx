import { useCallback, type FocusEvent } from 'react';
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { IconButton } from '@ds-root/components/IconButton';
import { CalendarTodayIcon } from '@ds-root/icons';

import { DATE_PICKER_LABEL } from '../../constants';
import { useMaskedPicker } from '../../hooks/useMaskedPicker';
import { InputField } from '../../InputField';
import { DATE_PLACEHOLDER, MASKED_DATE_LENGTH } from './constants';
import { formatDate, maskDate, parseDate } from './helpers';

export type DateFieldProps = Readonly<{
  label: string;
  /** Texto mascarado, possivelmente incompleto — é o que a pessoa digitou. */
  value: string;
  onChange: (masked: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  /** A presença da mensagem **é** o estado de erro do campo. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}>;

/** Campo de data do produto: o calendário é auxiliar do texto mascarado. */
export function DateField({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  required,
  disabled,
  minDate,
  maxDate,
}: DateFieldProps) {
  const { inputRef, anchor, handleChange, handleOpenPicker, handleClosePicker } = useMaskedPicker(
    maskDate,
    onChange,
  );

  const handleDatePick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      onChange(formatDate(date));
      handleClosePicker();
    },
    [onChange, handleClosePicker],
  );

  return (
    <>
      <InputField
        ref={inputRef}
        name={name}
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        error={error}
        fullWidth
        type="text"
        inputMode="numeric"
        placeholder={DATE_PLACEHOLDER}
        maxLength={MASKED_DATE_LENGTH}
        shrinkLabel={Boolean(value)}
        endAdornment={
          <IconButton
            type="button"
            label={DATE_PICKER_LABEL}
            onClick={handleOpenPicker}
            disabled={disabled}
          >
            <CalendarTodayIcon fontSize="small" />
          </IconButton>
        }
      />

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <DateCalendar
          value={parseDate(value)}
          onChange={handleDatePick}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Popover>
    </>
  );
}
