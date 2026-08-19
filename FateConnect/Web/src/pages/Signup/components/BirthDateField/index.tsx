import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskBirthDate } from '@app/utils/masks/birthDateMask';
import { DateCalendar, IconButton, InputAdornment, Popover, TextField } from '@design-system';
import { CalendarTodayIcon } from '@design-system/icons';

import {
  EARLIEST_BIRTH_DATE,
  formatBirthDate,
  latestBirthDate,
  parseBirthDate,
} from '../../helpers/birthDate';
import { CALENDAR_TOGGLE_LABEL, FIELD_LABELS, FIELD_PLACEHOLDERS } from '../../constants';
import { useFilledLabel } from '../../hooks/useFilledLabel';
import type { SignupFormValues } from '../../schema';

/** `dd/mm/aaaa` — o campo não aceita mais que isso. */
const MASKED_DATE_LENGTH = 10;

/**
 * Data de nascimento: texto com máscara `dd/mm/aaaa` como fonte de verdade e um
 * calendário auxiliar. Digitar continua sendo o caminho principal, com o cursor
 * preservado ao editar no meio — comportamento herdado do produto.
 */
export function BirthDateField() {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const birthDateField = useMaskedField(register('birthDate'), maskBirthDate);
  const birthDateLabel = useFilledLabel('birthDate');

  const handleOpenCalendar = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setPickedDate(parseBirthDate(getValues('birthDate')));
      setCalendarAnchor(event.currentTarget);
    },
    [getValues],
  );

  const handleCloseCalendar = useCallback(() => setCalendarAnchor(null), []);

  const handleDatePick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      setPickedDate(date);
      setValue('birthDate', formatBirthDate(date), { shouldValidate: true });
      setCalendarAnchor(null);
    },
    [setValue],
  );

  return (
    <>
      <TextField
        {...birthDateField}
        label={FIELD_LABELS.birthDate}
        required
        fullWidth
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={FIELD_PLACEHOLDERS.birthDate}
        error={Boolean(errors.birthDate)}
        helperText={errors.birthDate?.message}
        slotProps={{
          inputLabel: birthDateLabel,
          htmlInput: { maxLength: MASKED_DATE_LENGTH },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  aria-label={CALENDAR_TOGGLE_LABEL}
                  onClick={handleOpenCalendar}
                >
                  <CalendarTodayIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={handleCloseCalendar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <DateCalendar
          value={pickedDate}
          onChange={handleDatePick}
          minDate={EARLIEST_BIRTH_DATE}
          maxDate={latestBirthDate()}
        />
      </Popover>
    </>
  );
}
