import { firstItems } from './sequence';

/**
 * Partícula de nome não conta como sobrenome: "Maria da Silva" abrevia para MS,
 * não MD.
 */
const NAME_PARTICLES: ReadonlySet<string> = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
const FIRST_LETTER_POSITION = 0;
const SINGLE_NAME = 1;
const NAMES_PER_EDGE = 1;
const NO_NAMES = 0;

function firstLetter(namePart: string): string {
  return namePart.charAt(FIRST_LETTER_POSITION).toUpperCase();
}

/**
 * Iniciais das pontas da lista. Uma palavra só rende uma letra: tirar a segunda
 * da mesma palavra inventaria um sobrenome que não existe.
 */
function edgeInitials(names: readonly string[]): string {
  if (names.length <= SINGLE_NAME) return names.map(firstLetter).join('');

  return [...firstItems(names, NAMES_PER_EDGE), ...names.slice(-NAMES_PER_EDGE)]
    .map(firstLetter)
    .join('');
}

/** Iniciais do primeiro e do último nome, em maiúsculas. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const names = parts.filter((part) => !NAME_PARTICLES.has(part.toLowerCase()));
  if (names.length > NO_NAMES) return edgeInitials(names);

  // Sem nenhuma palavra que não seja partícula, não há primeiro e último a
  // distinguir — o que sobra é a primeira palavra do que veio.
  return edgeInitials(firstItems(parts, NAMES_PER_EDGE));
}
