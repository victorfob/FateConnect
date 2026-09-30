/** Base do documento: 1rem = 16px. */
const ROOT_FONT_SIZE = 16;

/**
 * Converte token de espaçamento (px) para `rem`. **Não** substitui o `spacing`
 * do tema: os componentes do MUI chamam `theme.spacing(1..3)` esperando o
 * multiplicador de 8px dele, e encolheriam em silêncio.
 */
export function spacing(...values: number[]): string {
  return values.map((value) => `${value / ROOT_FONT_SIZE}rem`).join(' ');
}
