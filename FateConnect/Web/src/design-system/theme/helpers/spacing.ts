/** Base do documento: 1rem = 16px. */
const ROOT_FONT_SIZE = 16;

/**
 * Converte token de espaçamento (px) para `rem`.
 *
 * Substitui a função padrão do MUI, que é **multiplicador de 8px**: sem este
 * override, `theme.spacing(16)` devolveria `128px` em vez de `1rem`. Trocar isso
 * não quebra build nem teste de tipo — só o layout, silenciosamente.
 */
export function spacing(...values: number[]): string {
  return values.map((value) => `${value / ROOT_FONT_SIZE}rem`).join(' ');
}
