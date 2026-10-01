import { useCallback, type FocusEvent, type Ref, type SyntheticEvent } from 'react';
import Autocomplete, { type AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import type { FilterOptionsState } from '@mui/material/useAutocomplete';

import { InputHelpButton } from '@ds-root/components/Input/components/InputHelpButton';
import { EndAdornment } from '@ds-root/components/Input/InputField/styles';

import { NO_SUGGESTIONS } from './constants';
import { browserAutoComplete, suggestionsFor } from './helpers';
import * as S from './styles';

export type AutocompleteFieldProps = Readonly<{
  label: string;
  /** Explicação do campo, atrás de um ícone de ajuda no fim do campo. */
  helpText?: string;
  /** O que o campo sugere; o texto digitado fora da lista continua valendo. */
  options: string[];
  /** O que o campo sugere ao receber o foco vazio, antes de qualquer letra. */
  emptyInputSuggestions?: string[];
  /** Campo que o navegador toma por endereço (o bairro): troca o histórico pelos endereços salvos. */
  addressLike?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  /** A presença da mensagem **é** o estado de erro do campo. */
  error?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLInputElement>;
}>;

export function AutocompleteField({
  label,
  helpText,
  options,
  emptyInputSuggestions = NO_SUGGESTIONS,
  addressLike = false,
  value,
  onChange,
  onBlur,
  name,
  error,
  placeholder,
  maxLength,
  required,
  disabled,
  ref,
}: AutocompleteFieldProps) {
  const filterSuggestions = useCallback(
    (candidates: string[], state: FilterOptionsState<string>) =>
      suggestionsFor(candidates, state.inputValue, emptyInputSuggestions),
    [emptyInputSuggestions],
  );

  const handleInputChange = useCallback(
    (_event: SyntheticEvent, text: string) => onChange(text),
    [onChange],
  );

  const renderInput = useCallback(
    ({ slotProps, ...params }: AutocompleteRenderInputParams) => (
      <S.FieldRoot
        {...params}
        label={label}
        name={name}
        placeholder={placeholder}
        required={required}
        inputRef={ref}
        onBlur={onBlur}
        error={Boolean(error)}
        helperText={error}
        slotProps={{
          ...slotProps,
          htmlInput: {
            ...slotProps.htmlInput,
            maxLength,
            autoComplete: browserAutoComplete(addressLike),
          },
          input: {
            ...slotProps.input,
            endAdornment: helpText && (
              <EndAdornment position="end">
                <InputHelpButton fieldLabel={label} helpText={helpText} />
              </EndAdornment>
            ),
          },
        }}
      />
    ),
    [label, name, placeholder, required, ref, onBlur, error, maxLength, helpText, addressLike],
  );

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={options}
      value={value}
      inputValue={value}
      onInputChange={handleInputChange}
      openOnFocus
      filterOptions={filterSuggestions}
      disabled={disabled}
      renderInput={renderInput}
    />
  );
}
