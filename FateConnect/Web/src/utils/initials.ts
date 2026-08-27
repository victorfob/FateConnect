/**
 * Partícula de nome não conta como sobrenome: "Maria da Silva" abrevia para MS,
 * não MD.
 */
const NAME_PARTICLES: ReadonlySet<string> = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

function firstLetter(namePart: string): string {
  return namePart.charAt(0).toUpperCase();
}

/**
 * Iniciais das pontas da lista. Uma palavra só rende uma letra: tirar a segunda
 * da mesma palavra inventaria um sobrenome que não existe.
 */
function edgeInitials(names: readonly string[]): string {
  if (names.length <= 1) return names.map(firstLetter).join('');

  return [...names.slice(0, 1), ...names.slice(-1)].map(firstLetter).join('');
}

/** Iniciais do primeiro e do último nome, em maiúsculas. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const names = parts.filter((part) => !NAME_PARTICLES.has(part.toLowerCase()));
  if (names.length > 0) return edgeInitials(names);

  // Sem nenhuma palavra que não seja partícula, não há primeiro e último a
  // distinguir — o que sobra é a primeira palavra do que veio.
  return edgeInitials(parts.slice(0, 1));
}
