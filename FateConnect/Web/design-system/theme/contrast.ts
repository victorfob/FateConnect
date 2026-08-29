/**
 * Constantes da definição de luminância relativa da WCAG 2.1. Os nomes seguem
 * o papel de cada número na fórmula — a especificação não os batiza.
 */
const CHANNEL_MAX = 255;
const LINEAR_SEGMENT_THRESHOLD = 0.03928;
const LINEAR_SEGMENT_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
/** Evita divisão por zero quando uma das cores é preto puro. */
const CONTRAST_OFFSET = 0.05;
const HEX_RADIX = 16;
const HEX_CHANNEL_LENGTH = 2;
const RED_POSITION = 0;
const ABSENT_CHANNEL = 0;
const GREEN_POSITION = 1;
const BLUE_POSITION = 2;
const ALPHA_POSITION = 3;
const OPAQUE = 1;

type Rgb = { red: number; green: number; blue: number };

function toLinearChannel(value: number): number {
  const normalized = value / CHANNEL_MAX;

  if (normalized <= LINEAR_SEGMENT_THRESHOLD) return normalized / LINEAR_SEGMENT_DIVISOR;

  return ((normalized + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
}

function toNumbers(text: string): number[] {
  return text.split(',').map(Number);
}

function fromHex(hex: string): Rgb {
  const channelAt = (position: number): number => {
    const start = position * HEX_CHANNEL_LENGTH;

    return Number.parseInt(hex.slice(start, start + HEX_CHANNEL_LENGTH), HEX_RADIX);
  };

  return {
    red: channelAt(RED_POSITION),
    green: channelAt(GREEN_POSITION),
    blue: channelAt(BLUE_POSITION),
  };
}

function toRgb(color: string): Rgb {
  const short = /^#([0-9a-f]{3})$/i.exec(color.trim())?.[1];
  // `#fff` é como o MUI escreve `common.white`. Sem expandir, a medição estoura
  // em vez de medir — e um teste que estoura não avisa o que estava errado.
  if (short) return fromHex([...short].map((channel) => channel + channel).join(''));

  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (hex) return fromHex(hex);

  const channels = /rgba?\(([^)]+)\)/.exec(color)?.[1];
  if (!channels) throw new Error(`Cor não reconhecida: ${color}`);

  const values = toNumbers(channels);

  return {
    red: values[RED_POSITION] ?? ABSENT_CHANNEL,
    green: values[GREEN_POSITION] ?? ABSENT_CHANNEL,
    blue: values[BLUE_POSITION] ?? ABSENT_CHANNEL,
  };
}

/**
 * Achata uma cor com transparência sobre um fundo opaco. As "on colors" do
 * tema escuro usam alfa, e o contraste precisa ser medido na cor resultante.
 */
function flatten(color: string, background: string): Rgb {
  const channels = /rgba\(([^)]+)\)/.exec(color)?.[1];
  if (!channels) return toRgb(color);

  const values = toNumbers(channels);
  const alpha = values[ALPHA_POSITION] ?? OPAQUE;
  const backdrop = toRgb(background);
  const blend = (value: number, backdropValue: number): number =>
    value * alpha + backdropValue * (OPAQUE - alpha);

  return {
    red: blend(values[RED_POSITION] ?? ABSENT_CHANNEL, backdrop.red),
    green: blend(values[GREEN_POSITION] ?? ABSENT_CHANNEL, backdrop.green),
    blue: blend(values[BLUE_POSITION] ?? ABSENT_CHANNEL, backdrop.blue),
  };
}

export function relativeLuminance(color: string, background = '#FFFFFF'): number {
  const { red, green, blue } = flatten(color, background);

  return (
    RED_WEIGHT * toLinearChannel(red) +
    GREEN_WEIGHT * toLinearChannel(green) +
    BLUE_WEIGHT * toLinearChannel(blue)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground, background);
  const backgroundLuminance = relativeLuminance(background, background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
}

/** Mínimos da WCAG nível AA. */
export const AA_NORMAL_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;
/**
 * Limite da WCAG 1.4.11, para o que **não é texto**. Vale 3 como o texto grande,
 * mas por outra razão: um nome só faria escolher pelo número, não pelo papel.
 */
export const AA_NON_TEXT = 3;
