import { useCallback, useState, type FocusEvent, type MouseEvent } from 'react';
import { usePickerTranslations } from '@mui/x-date-pickers/hooks';
import type { DateOrTimeView } from '@mui/x-date-pickers/models';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';

import { IconButton } from '@ds-root/components/IconButton';
import { CalendarTodayIcon } from '@ds-root/icons';

import { DATE_TIME_PICKER_LABEL } from '../../constants';
import { useMaskedPicker } from '../../hooks/useMaskedPicker';
import { InputField } from '../../InputField';
import {
  DATE_TIME_PLACEHOLDER,
  DAY_VIEW,
  HOURS_VIEW,
  MASKED_DATE_TIME_LENGTH,
  MINUTES_VIEW,
  PICKER_SLOT_PROPS,
  PICKER_VIEWS,
} from './constants';
import {
  formatDateTime,
  isOptionOfColumn,
  isPickerView,
  maskDateTime,
  parseDateTimeSoFar,
} from './helpers';
import * as S from './styles';

export type DateTimeFieldProps = Readonly<{
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
  /** Dia que o calendário não deixa escolher; digitado, quem recusa é a validação. */
  shouldDisableDate?: (day: Date) => boolean;
}>;

/**
 * Campo de data e hora do produto, com o texto mascarado como fonte de verdade
 * e o seletor da biblioteca num painel que o nosso tema desenha.
 */
export function DateTimeField({
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
  shouldDisableDate,
}: DateTimeFieldProps) {
  const { inputRef, anchor, handleChange, handleOpenPicker, handleClosePicker } = useMaskedPicker(
    maskDateTime,
    onChange,
  );
  const [view, setView] = useState<DateOrTimeView>(DAY_VIEW);
  const minutesColumnLabel = usePickerTranslations().selectViewText(MINUTES_VIEW);

  const handleViewChange = useCallback((next: string) => {
    if (isPickerView(next)) setView(next);
  }, []);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setView(DAY_VIEW);
      handleOpenPicker(event);
    },
    [handleOpenPicker],
  );

  /**
   * Escolhido o dia, o painel vai para a hora; escolhido o minuto, ele fecha. O
   * minuto que muda fecha aqui, e o que já estava escolhido, que não dispara
   * mudança nenhuma no seletor, fecha em `handlePanelClick`.
   */
  const handlePick = useCallback(
    (date: Date | null) => {
      if (!date) return;

      const previous = parseDateTimeSoFar(value);
      onChange(formatDateTime(date));

      if (view === DAY_VIEW) {
        setView(HOURS_VIEW);
        return;
      }
      if (previous?.getMinutes() !== date.getMinutes()) handleClosePicker();
    },
    [onChange, value, view, handleClosePicker],
  );

  const handlePanelClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isOptionOfColumn(event.target, minutesColumnLabel)) handleClosePicker();
    },
    [minutesColumnLabel, handleClosePicker],
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
        placeholder={DATE_TIME_PLACEHOLDER}
        maxLength={MASKED_DATE_TIME_LENGTH}
        shrinkLabel={Boolean(value)}
        endAdornment={
          <IconButton
            type="button"
            label={DATE_TIME_PICKER_LABEL}
            onClick={handleOpen}
            disabled={disabled}
          >
            <CalendarTodayIcon fontSize="small" />
          </IconButton>
        }
      />

      <S.PickerPopover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClosePicker}
        onClick={handlePanelClick}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/*
          Uma peça por vez, com o valor em construção no topo. As duas lado a
          lado somam 640px: no celular cobriam a tela e escondiam o campo que o
          painel edita, e no desktop engoliam o diálogo.
        */}
        <StaticDateTimePicker
          displayStaticWrapperAs="mobile"
          value={parseDateTimeSoFar(value)}
          onChange={handlePick}
          view={view}
          onViewChange={handleViewChange}
          views={PICKER_VIEWS}
          minDate={minDate}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableDate}
          slotProps={PICKER_SLOT_PROPS}
        />
      </S.PickerPopover>
    </>
  );
}
