const TEXT_START = 0;
const NO_DIGITS = 0;
const AFTER_DIGIT = 1;

export function onlyDigits(text: string): string {
  return text.replaceAll(/\D/g, '');
}

export function countDigits(text: string): number {
  return onlyDigits(text).length;
}

/**
 * Posição do cursor logo após o n-ésimo dígito do texto já mascarado.
 *
 * É o que permite editar no meio de um campo com máscara sem o cursor pular
 * para o fim: guarda-se quantos dígitos estavam à esquerda do cursor antes da
 * formatação e reencontra-se essa mesma fronteira no texto formatado.
 */
export function caretAfterDigitCount(maskedValue: string, digitCount: number): number {
  if (digitCount <= NO_DIGITS) return TEXT_START;

  let digitsSeen = NO_DIGITS;

  for (let index = TEXT_START; index < maskedValue.length; index++) {
    const character = maskedValue[index];
    if (character === undefined || !/\d/.test(character)) continue;

    digitsSeen++;
    if (digitsSeen >= digitCount) return index + AFTER_DIGIT;
  }

  return maskedValue.length;
}
