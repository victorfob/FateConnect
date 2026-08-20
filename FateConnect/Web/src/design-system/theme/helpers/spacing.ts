/** Base do documento: 1rem = 16px. */
const ROOT_FONT_SIZE = 16;

/**
 * Converte token de espaçamento (px) para `rem`.
 *
 * **Não** substitui o `spacing` do tema. O MUI chama `theme.spacing(1..3)`
 * internamente — gutters do Toolbar, padding de Dialog, de Card — esperando o
 * multiplicador de 8px dele. Sobrescrever aquilo encolhe todos esses
 * componentes silenciosamente: as gutters do Toolbar viravam 3px no lugar de
 * 24px. Nossos estilos usam este helper; o MUI continua com o dele.
 */
export function spacing(...values: number[]): string {
  return values.map((value) => `${value / ROOT_FONT_SIZE}rem`).join(' ');
}
