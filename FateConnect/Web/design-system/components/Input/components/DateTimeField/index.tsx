import { useCallback, useState, type FocusEvent, type MouseEvent } from 'react';
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
  PICKER_SLOT_PROPS,
  PICKER_VIEWS,
} from './constants';
import { formatDateTime, isPickerView, maskDateTime, parseDateTimeSoFar } from './helpers';
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
}: DateTimeFieldProps) {
  const { inputRef, anchor, handleChange, handleOpenPicker, handleClosePicker } = useMaskedPicker(
    maskDateTime,
    onChange,
  );
  const [view, setView] = useState<DateOrTimeView>(DAY_VIEW);

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
   * O painel anda sozinho: escolhido o dia ele vai para a hora — a aba de volta
   * continua ali —, e escolhido o minuto ele fecha, como o campo só de data
   * fecha ao escolher o dia.
   *
   * ⚠️ O seletor não diz qual trecho foi tocado: a prop recebe a data e um
   * contexto, e nada mais. Do dia dá para saber pela vista, porque o calendário
   * só aparece nela; do minuto, não — hora e minuto ficam **na tela ao mesmo
   * tempo**, e mexer só no minuto não troca vista nenhuma. Aí quem responde é a
   * comparação com o valor que já estava lá.
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
          onAccept={handleClosePicker}
          view={view}
          onViewChange={handleViewChange}
          views={PICKER_VIEWS}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={PICKER_SLOT_PROPS}
        />
      </S.PickerPopover>
    </>
  );
}
