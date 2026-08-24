import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskBirthDate } from '@app/utils/masks/birthDateMask';
import { DateCalendar, IconButton, Input, Popover } from '@design-system';
import { CalendarTodayIcon } from '@design-system/icons';

import {
  EARLIEST_BIRTH_DATE,
  formatBirthDate,
  latestBirthDate,
  parseBirthDate,
} from '@app/pages/Signup/helpers/birthDate';
import * as C from '@app/pages/Signup/constants';
import { useFilledLabel } from '@app/pages/Signup/hooks/useFilledLabel';
import type { SignupFormValues } from '@app/pages/Signup/schema';

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
  const isBirthDateFilled = useFilledLabel('birthDate');

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
      <Input
        {...birthDateField}
        label={C.FIELD_LABELS.birthDate}
        required
        fullWidth
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={C.FIELD_PLACEHOLDERS.birthDate}
        error={errors.birthDate?.message}
        shrinkLabel={isBirthDateFilled}
        maxLength={MASKED_DATE_LENGTH}
        endAdornment={
          <IconButton
            type="button"
            aria-label={C.CALENDAR_TOGGLE_LABEL}
            onClick={handleOpenCalendar}
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
          value={pickedDate}
          onChange={handleDatePick}
          minDate={EARLIEST_BIRTH_DATE}
          maxDate={latestBirthDate()}
        />
      </Popover>
    </>
  );
}
