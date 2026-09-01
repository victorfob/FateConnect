import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { IconButton } from '@ds-root/components/IconButton';
import { CalendarTodayIcon } from '@ds-root/icons';
import { caretAfterDigitCount, countDigits } from '@ds-root/utils/text';

import { DATE_PICKER_LABEL } from '../../constants';
import { InputField } from '../../InputField';
import { DATE_PLACEHOLDER, MASKED_DATE_LENGTH } from './constants';
import { formatDate, maskDate, parseDate } from './helpers';

const TEXT_START = 0;
const NO_CARET = -1;

export type DateFieldProps = Readonly<{
  label: ReactNode;
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

/**
 * Campo de data do produto: o texto mascarado é a fonte de verdade e o
 * calendário é auxiliar. Digitar é o caminho principal, com o cursor preservado
 * ao editar no meio — sem isso ele pula para o fim a cada tecla.
 */
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretRef = useRef(NO_CARET);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretRef.current === NO_CARET) return;

    input.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = NO_CARET;
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const typed = event.target.value;
      const masked = maskDate(typed);
      const caretIndex = event.target.selectionStart ?? typed.length;

      caretRef.current = caretAfterDigitCount(
        masked,
        countDigits(typed.slice(TEXT_START, caretIndex)),
      );
      onChange(masked);
    },
    [onChange],
  );

  const handleOpenCalendar = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => setCalendarAnchor(event.currentTarget),
    [],
  );

  const handleCloseCalendar = useCallback(() => setCalendarAnchor(null), []);

  const handleDatePick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      onChange(formatDate(date));
      setCalendarAnchor(null);
    },
    [onChange],
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
            onClick={handleOpenCalendar}
            disabled={disabled}
          >
            <CalendarTodayIcon fontSize="small" />
          </IconButton>
        }
      />

      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={handleCloseCalendar}
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
