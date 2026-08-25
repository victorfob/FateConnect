import type { Theme } from '@mui/material/styles';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';

/**
 * Tom da etiqueta de estado. `neutral` é o único que **não desenha caixa**: ele
 * serve o valor desconhecido, que aparece como texto corrido. Estado que precisa
 * parecer etiqueta usa `muted`, e não `neutral`.
 */
export type StatusTagTone = 'neutral' | 'muted' | 'success' | 'warning' | 'danger';

const NO_SURFACE = 'transparent';
const INHERITED_CONTENT = 'inherit';

const LIGHT_SURFACE: Record<StatusTagTone, string> = {
  neutral: NO_SURFACE,
  muted: colorTokens.mutedBackground,
  success: colorTokens.successBackground,
  warning: colorTokens.warningBackground,
  danger: colorTokens.dangerBackground,
};

const DARK_SURFACE: Record<StatusTagTone, string> = {
  neutral: NO_SURFACE,
  muted: darkColorTokens.mutedTagBackground,
  success: darkColorTokens.successTagBackground,
  warning: darkColorTokens.warningTagBackground,
  danger: darkColorTokens.dangerTagBackground,
};

const LIGHT_CONTENT: Record<StatusTagTone, string> = {
  neutral: INHERITED_CONTENT,
  muted: colorTokens.mutedText,
  success: colorTokens.successText,
  warning: colorTokens.warningText,
  // O vermelho do produto não passa AA sobre o pastel; o mesmo escurecido passa.
  // É a cor que o aviso de erro já usa, então os dois vermelhos combinam.
  danger: colorVariants.secondaryDark,
};

const DARK_CONTENT: Record<StatusTagTone, string> = {
  neutral: INHERITED_CONTENT,
  muted: darkColorTokens.mutedTagText,
  success: darkColorTokens.successTagText,
  warning: darkColorTokens.warningTagText,
  danger: darkColorTokens.dangerTagText,
};

/** Fundo da etiqueta. No tema escuro o par inverte de claridade, não de papel. */
export function statusTagSurface(theme: Theme, tone: StatusTagTone): string {
  if (theme.palette.mode === 'dark') return DARK_SURFACE[tone];

  return LIGHT_SURFACE[tone];
}

/** Cor do texto da etiqueta, medida contra o fundo em `contrast.test.ts`. */
export function onStatusTagSurface(theme: Theme, tone: StatusTagTone): string {
  if (theme.palette.mode === 'dark') return DARK_CONTENT[tone];

  return LIGHT_CONTENT[tone];
}
