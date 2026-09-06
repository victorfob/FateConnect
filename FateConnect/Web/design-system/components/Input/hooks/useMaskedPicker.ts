import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type RefObject,
} from 'react';

import { caretAfterDigitCount, countDigits } from '@ds-root/utils/text';

const TEXT_START = 0;
const NO_CARET = -1;

type MaskFunction = (typed: string) => string;

export type MaskedPicker = {
  inputRef: RefObject<HTMLInputElement | null>;
  /** O gatilho que abriu o seletor, ou `null` enquanto ele está fechado. */
  anchor: HTMLElement | null;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleOpenPicker: (event: MouseEvent<HTMLButtonElement>) => void;
  handleClosePicker: VoidFunction;
};

/**
 * O texto mascarado é a fonte de verdade e o seletor é auxiliar. Digitar é o
 * caminho principal, com o cursor preservado ao editar no meio — sem isso ele
 * pula para o fim a cada tecla.
 */
export function useMaskedPicker(
  mask: MaskFunction,
  onChange: (masked: string) => void,
): MaskedPicker {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretRef = useRef(NO_CARET);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretRef.current === NO_CARET) return;

    input.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = NO_CARET;
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const typed = event.target.value;
      const masked = mask(typed);
      const caretIndex = event.target.selectionStart ?? typed.length;

      caretRef.current = caretAfterDigitCount(
        masked,
        countDigits(typed.slice(TEXT_START, caretIndex)),
      );
      onChange(masked);
    },
    [mask, onChange],
  );

  const handleOpenPicker = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget),
    [],
  );

  const handleClosePicker = useCallback(() => setAnchor(null), []);

  return { inputRef, anchor, handleChange, handleOpenPicker, handleClosePicker };
}
