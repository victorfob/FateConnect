import { ADDRESS_OFF_AUTOCOMPLETE, HISTORY_OFF_AUTOCOMPLETE, SUGGESTION_LIMIT } from '../constants';

const LIST_START = 0;
const DIACRITICS = /\p{Diacritic}/gu;
const WORD_SEPARATORS = /[\s,]+/;

function comparable(text: string): string {
  return text.normalize('NFD').replaceAll(DIACRITICS, '').toLowerCase();
}

/**
 * Cada palavra digitada vale em qualquer ponto da opção, para que "centro voto"
 * ache "Centro, Votorantim" sem a pessoa digitar a vírgula.
 */
export function suggestionsFor(
  options: string[],
  inputValue: string,
  emptyInputSuggestions: string[],
): string[] {
  const words = comparable(inputValue).split(WORD_SEPARATORS).filter(Boolean);

  if (!words.length) return emptyInputSuggestions;

  return options
    .filter((option) => words.every((word) => comparable(option).includes(word)))
    .slice(LIST_START, SUGGESTION_LIMIT);
}

/** O valor que tira do caminho o painel que o Chrome abriria para aquele campo. */
export function browserAutoComplete(addressLike: boolean): string {
  if (addressLike) return ADDRESS_OFF_AUTOCOMPLETE;

  return HISTORY_OFF_AUTOCOMPLETE;
}
