import type { Theme } from '@mui/material/styles';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';

export type NotificationVariant = 'success' | 'error' | 'warning';

/**
 * Cor do aviso. No produto o fundo é pastel por estado e o texto é sempre o
 * apagado — nada de fundo saturado com texto branco, que é o padrão da
 * biblioteca. No tema escuro o par inverte de claridade (fundo escuro, texto
 * claro), como já acontece na etiqueta de estado.
 */
const LIGHT_SURFACE: Record<NotificationVariant, string> = {
  success: colorTokens.successBackground,
  error: colorTokens.dangerBackground,
  warning: colorTokens.warningBackground,
};

const DARK_SURFACE: Record<NotificationVariant, string> = {
  success: darkColorTokens.successTagBackground,
  error: darkColorTokens.dangerTagBackground,
  warning: darkColorTokens.warningTagBackground,
};

/**
 * O produto pinta o texto das três variantes com o cinza apagado, que sobre
 * esses pastéis não alcança AA — medido em `contrast.test.ts`. Aqui cada
 * variante usa a própria cor de estado, como a etiqueta já faz, o que passa o
 * limite sem trocar o fundo.
 *
 * No erro, o vermelho do produto sobre o pastel dá 4.13:1; o mesmo vermelho
 * escurecido 20% dá 5.79:1. É a mesma correção que `error.main` já recebeu.
 */
const LIGHT_CONTENT: Record<NotificationVariant, string> = {
  success: colorTokens.successText,
  error: colorVariants.secondaryDark,
  warning: colorTokens.warningText,
};

const DARK_CONTENT: Record<NotificationVariant, string> = {
  success: darkColorTokens.successTagText,
  error: darkColorTokens.dangerTagText,
  warning: darkColorTokens.warningTagText,
};

export function notificationSurface(theme: Theme, variant: NotificationVariant): string {
  if (theme.palette.mode === 'dark') return DARK_SURFACE[variant];

  return LIGHT_SURFACE[variant];
}

/** Conteúdo sobre o aviso — a cor de estado que passa o contraste sobre o pastel. */
export function onNotificationSurface(theme: Theme, variant: NotificationVariant): string {
  if (theme.palette.mode === 'dark') return DARK_CONTENT[variant];

  return LIGHT_CONTENT[variant];
}
