/** Dígitos do texto, sem separador nem espaço. */
export function onlyDigits(text: string): string {
  return text.replaceAll(/\D/g, '');
}

/** Quantos dígitos existem no trecho. */
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
  if (digitCount <= 0) return 0;

  let digitsSeen = 0;

  for (let index = 0; index < maskedValue.length; index++) {
    const character = maskedValue[index];
    if (character === undefined || !/\d/.test(character)) continue;

    digitsSeen++;
    if (digitsSeen >= digitCount) return index + 1;
  }

  return maskedValue.length;
}
