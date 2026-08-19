import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { caretAfterDigitCount, countDigits } from '@app/utils/masks/caret';

type MaskFunction = (value: string) => string;

/**
 * Envolve um campo registrado no formulário para aplicar a máscara no próprio
 * input, antes de o formulário ler o valor, e devolver o cursor à posição
 * equivalente — sem isso, editar no meio do campo joga o cursor para o fim.
 *
 * O input é não controlado (o formulário lê por referência), então escrever em
 * `input.value` aqui é o que mantém a máscara e o valor validado em sincronia.
 */
export function useMaskedField<Field extends UseFormRegisterReturn>(
  field: Field,
  mask: MaskFunction,
): Field {
  const { onChange } = field;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const maskedValue = mask(input.value);

      if (maskedValue !== input.value) {
        const caretIndex = input.selectionStart ?? input.value.length;
        const digitsBeforeCaret = countDigits(input.value.slice(0, caretIndex));

        input.value = maskedValue;

        const maskedCaretIndex = caretAfterDigitCount(maskedValue, digitsBeforeCaret);
        input.setSelectionRange(maskedCaretIndex, maskedCaretIndex);
      }

      return onChange(event);
    },
    [mask, onChange],
  );

  return { ...field, onChange: handleChange };
}
