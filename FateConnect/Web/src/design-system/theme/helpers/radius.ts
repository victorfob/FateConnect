const ROOT_FONT_SIZE = 16;

/** Converte token de raio (px) para `rem`, na mesma convenção do spacing. */
export function radius(...values: number[]): string {
  return values.map((value) => `${value / ROOT_FONT_SIZE}rem`).join(' ');
}
