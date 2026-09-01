import { useCallback, useRef, type ReactNode, type Ref } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import type { OutlinedTextFieldProps } from '@mui/material/TextField';

import { TimePickerButton } from '../components/TimePickerButton';
import * as S from '../styles';

const TIME_TYPE = 'time';

/** Desenham conteúdo mesmo vazios, então o rótulo ficaria por cima dele. */
const ALWAYS_SHRUNK_TYPES: ReadonlySet<string> = new Set([TIME_TYPE]);

type InputFieldOwnProps = {
  /** Uma string, quase sempre; `Input.HelpLabel` quando o campo precisa se explicar. */
  label: ReactNode;
  /** A presença da mensagem **é** o estado de erro do campo. */
  error?: string;
  endAdornment?: ReactNode;
  /** Sobe o rótulo sem esperar o foco, para valor que chega de fora — o CEP. */
  shrinkLabel?: boolean;
  maxLength?: number;
  ref?: Ref<HTMLInputElement>;
};

export type InputProps = InputFieldOwnProps &
  Omit<
    OutlinedTextFieldProps,
    'label' | 'error' | 'helperText' | 'variant' | 'slotProps' | 'ref' | 'select'
  >;

/**
 * Campo do produto. O rótulo é uma string e quem o desenha é o MUI — é isso que
 * faz o texto parecer indicação de campo vazio, e não valor já digitado.
 */
export function InputField({
  label,
  error,
  endAdornment,
  shrinkLabel,
  maxLength,
  ref,
  type,
  ...textFieldProps
}: InputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Dois donos: quem registrou o campo no formulário e o botão do relógio.
  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;

      if (typeof ref === 'function') {
        ref(element);
        return;
      }
      if (ref) ref.current = element;
    },
    [ref],
  );

  const handleOpenTimePicker = useCallback(() => inputRef.current?.showPicker(), []);

  const isTime = type === TIME_TYPE;
  const hasAdornment = Boolean(endAdornment) || isTime;
  const shrunk = shrinkLabel || ALWAYS_SHRUNK_TYPES.has(type ?? '');

  return (
    <S.FieldRoot
      {...textFieldProps}
      type={type}
      label={label}
      inputRef={setInputRef}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        // Sem `shrink` o MUI decide sozinho, e o rótulo sobe animado no foco.
        inputLabel: shrunk ? { shrink: true } : undefined,
        htmlInput: maxLength ? { maxLength } : undefined,
        input: {
          endAdornment: hasAdornment ? (
            <InputAdornment position="end">
              {endAdornment}
              {isTime ? <TimePickerButton onOpen={handleOpenTimePicker} /> : null}
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}
