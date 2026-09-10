import { useCallback, useMemo, type FocusEvent } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { IconButton } from '@ds-root/components/IconButton';
import { CalendarTodayIcon } from '@ds-root/icons';

import { DATE_PICKER_LABEL } from '../../constants';
import { useMaskedPicker } from '../../hooks/useMaskedPicker';
import { InputField } from '../../InputField';
import { formatDate } from '../DateField/helpers';
import {
  formatDateRange,
  isDayBefore,
  isInvertedRange,
  maskDateRange,
  parseRangeSoFar,
} from './helpers';
import * as C from './constants';
import * as S from './styles';

export type DateRangeFieldProps = Readonly<{
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

/** Campo de período do produto: o calendário é auxiliar do texto mascarado. */
export function DateRangeField({
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
}: DateRangeFieldProps) {
  const { inputRef, anchor, handleChange, handleOpenPicker, handleClosePicker } = useMaskedPicker(
    maskDateRange,
    onChange,
  );

  const range = useMemo(() => parseRangeSoFar(value), [value]);
  const isAwaitingEnd = Boolean(range.start) && !range.end;

  // A mensagem do consumidor ganha: a prop é dele, e a nossa existe para o
  // silêncio em que o texto se contradiz e nada explica por quê.
  const fieldError = useMemo(() => {
    if (error) return error;
    if (isInvertedRange(value)) return C.INVERTED_RANGE_MESSAGE;

    return undefined;
  }, [error, value]);

  /**
   * Dia anterior ao início recomeça a escolha, senão um início errado não teria
   * correção; intervalo já fechado recomeça pela mesma razão. O mesmo dia duas
   * vezes fecha um período de um dia, e é o que a comparação por dia preserva.
   */
  const handleDayPick = useCallback(
    (picked: Date | null) => {
      if (!picked) return;

      const { start, end } = range;
      if (!start || end || isDayBefore(picked, start)) {
        onChange(formatDate(picked));
        return;
      }

      onChange(formatDateRange(start, picked));
      handleClosePicker();
    },
    [range, onChange, handleClosePicker],
  );

  const handleClear = useCallback(() => onChange(''), [onChange]);

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
        error={fieldError}
        fullWidth
        type="text"
        inputMode="numeric"
        placeholder={C.DATE_RANGE_PLACEHOLDER}
        maxLength={C.MASKED_DATE_RANGE_LENGTH}
        shrinkLabel={Boolean(value)}
        endAdornment={
          <>
            {Boolean(value) && (
              <IconButton
                type="button"
                label={C.CLEAR_DATE_RANGE_LABEL}
                onClick={handleClear}
                disabled={disabled}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton
              type="button"
              label={DATE_PICKER_LABEL}
              onClick={handleOpenPicker}
              disabled={disabled}
            >
              <CalendarTodayIcon fontSize="small" />
            </IconButton>
          </>
        }
      />

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <S.PickerStepHint variant="caption" role="status">
          {isAwaitingEnd ? C.END_DATE_HINT : C.START_DATE_HINT}
        </S.PickerStepHint>

        <DateCalendar
          value={range.start}
          onChange={handleDayPick}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Popover>
    </>
  );
}
