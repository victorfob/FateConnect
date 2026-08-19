/** Canal linearizado, conforme a definição de luminância relativa da WCAG. */
function canalLinear(valor: number): number {
  const normalizado = valor / 255;

  if (normalizado <= 0.03928) return normalizado / 12.92;
  return ((normalizado + 0.055) / 1.055) ** 2.4;
}

function canaisDe(texto: string): number[] {
  return texto.split(',').map((parte) => Number(parte));
}

function toRgb(color: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (hex) {
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return [r ?? 0, g ?? 0, b ?? 0];
  }

  const conteudo = /rgba?\(([^)]+)\)/.exec(color)?.[1];
  if (!conteudo) throw new Error(`Cor não reconhecida: ${color}`);

  const [r, g, b] = canaisDe(conteudo);
  return [r ?? 0, g ?? 0, b ?? 0];
}

/**
 * Achata uma cor com transparência sobre um fundo opaco. As "on colors" do
 * tema escuro usam alfa, e o contraste precisa ser medido na cor resultante.
 */
function achatar(color: string, background: string): [number, number, number] {
  const conteudo = /rgba\(([^)]+)\)/.exec(color)?.[1];
  if (!conteudo) return toRgb(color);

  const partes = canaisDe(conteudo);
  const alfa = partes[3] ?? 1;
  const fundo = toRgb(background);
  const [r, g, b] = [0, 1, 2].map((i) => (partes[i] ?? 0) * alfa + (fundo[i] ?? 0) * (1 - alfa));

  return [r ?? 0, g ?? 0, b ?? 0];
}

export function relativeLuminance(color: string, background = '#FFFFFF'): number {
  const [r, g, b] = achatar(color, background);

  return 0.2126 * canalLinear(r) + 0.7152 * canalLinear(g) + 0.0722 * canalLinear(b);
}

/** Razão de contraste da WCAG entre duas cores, de 1:1 a 21:1. */
export function contrastRatio(foreground: string, background: string): number {
  const luminanciaTexto = relativeLuminance(foreground, background);
  const luminanciaFundo = relativeLuminance(background, background);
  const clara = Math.max(luminanciaTexto, luminanciaFundo);
  const escura = Math.min(luminanciaTexto, luminanciaFundo);

  return (clara + 0.05) / (escura + 0.05);
}

/** Mínimos da WCAG nível AA. */
export const AA_NORMAL_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;
