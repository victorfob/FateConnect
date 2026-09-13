import { useCallback, useMemo, useState, type FocusEvent, type MouseEvent } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import type { PickerDayProps } from '@mui/x-date-pickers';
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
import { RangeDay } from './RangeDay';
import type { PartialDateRange } from './types';
import * as C from './constants';
import * as S from './styles';

const EMPTY_RANGE: PartialDateRange = { start: null, end: null };

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

  /**
   * O calendário guarda rascunho e só comita no `Aplicar`. Sem isso a faixa do
   * período apareceria e sumiria no mesmo toque que a cria.
   */
  const [draft, setDraft] = useState<PartialDateRange>(EMPTY_RANGE);

  // A mensagem do consumidor ganha: a prop é dele, e a nossa existe para o
  // silêncio em que o texto se contradiz e nada explica por quê.
  const fieldError = useMemo(() => {
    if (error) return error;
    if (isInvertedRange(value)) return C.INVERTED_RANGE_MESSAGE;

    return undefined;
  }, [error, value]);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setDraft(parseRangeSoFar(value));
      handleOpenPicker(event);
    },
    [value, handleOpenPicker],
  );

  /**
   * Dia anterior ao início recomeça a escolha, senão um início errado não teria
   * correção; intervalo já fechado recomeça pela mesma razão. O mesmo dia duas
   * vezes fecha um período de um dia, e é o que a comparação por dia preserva.
   */
  const handleDayPick = useCallback((picked: Date | null) => {
    if (!picked) return;

    setDraft((previous) => {
      const { start, end } = previous;
      if (!start || end || isDayBefore(picked, start)) return { start: picked, end: null };

      return { start, end: picked };
    });
  }, []);

  const handleApply = useCallback(() => {
    const { start, end } = draft;
    if (!start) return;

    if (end) onChange(formatDateRange(start, end));
    else onChange(formatDate(start));

    handleClosePicker();
  }, [draft, onChange, handleClosePicker]);

  const handleClear = useCallback(() => {
    setDraft(EMPTY_RANGE);
    onChange('');
    handleClosePicker();
  }, [onChange, handleClosePicker]);

  const renderDay = useCallback(
    (dayProps: PickerDayProps) => <RangeDay {...dayProps} range={draft} />,
    [draft],
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
        error={fieldError}
        fullWidth
        type="text"
        inputMode="numeric"
        placeholder={C.DATE_RANGE_PLACEHOLDER}
        maxLength={C.MASKED_DATE_RANGE_LENGTH}
        shrinkLabel={Boolean(value)}
        endAdornment={
          <IconButton
            type="button"
            label={DATE_PICKER_LABEL}
            onClick={handleOpen}
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
          value={draft.start}
          onChange={handleDayPick}
          minDate={minDate}
          maxDate={maxDate}
          slots={{ day: renderDay }}
        />

        <S.PickerFooter>
          <Button type="button" variant="contained" color="primary" onClick={handleClear}>
            <Typography variant="subtitleBold" color="inherit">
              {C.CLEAR_LABEL}
            </Typography>
          </Button>

          <Button type="button" variant="contained" color="secondary" onClick={handleApply}>
            <Typography variant="subtitleBold" color="inherit">
              {C.APPLY_LABEL}
            </Typography>
          </Button>
        </S.PickerFooter>
      </Popover>
    </>
  );
}
