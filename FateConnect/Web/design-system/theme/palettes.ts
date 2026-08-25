import type { PaletteOptions } from '@mui/material/styles';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';

/**
 * Paletas construídas segundo o sistema de cor do Material Design: cada cor de
 * marca tem `light`, `main` e `dark`, e cada superfície declara a cor do
 * conteúdo que vai sobre ela (`contrastText`, `text.*`).
 *
 * As razões de contraste são verificadas em `contrast.test.ts`.
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    light: colorVariants.primaryLight,
    main: colorTokens.primary,
    dark: colorVariants.primaryDark,
    contrastText: colorTokens.textOnAccent,
  },
  secondary: {
    light: colorVariants.secondaryLight,
    main: colorTokens.accent,
    dark: colorVariants.secondaryDark,
    // Branco puro: o branco a 90% do produto ficava em 4.42:1, abaixo de AA.
    contrastText: colorTokens.surfaceWhite,
  },
  error: {
    light: colorTokens.errorInherited,
    main: colorTokens.error,
    dark: colorVariants.errorDark,
    contrastText: colorTokens.surfaceWhite,
  },
  // `light` é o fundo da etiqueta de estado e `main` o texto sobre ele.
  success: { main: colorTokens.successText, light: colorTokens.successBackground },
  warning: { main: colorTokens.warningText, light: colorTokens.warningBackground },
  background: { default: colorTokens.surfaceGray, paper: colorTokens.surfaceWhite },
  text: {
    primary: colorTokens.primary,
    secondary: colorTokens.textMuted,
    disabled: colorTokens.textOnGray,
  },
  action: { hover: colorTokens.hover },
  divider: colorTokens.divider,
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: darkColorTokens.primary,
    contrastText: darkColorTokens.surface,
  },
  secondary: {
    main: darkColorTokens.secondary,
    contrastText: darkColorTokens.surface,
  },
  error: {
    main: darkColorTokens.error,
    contrastText: darkColorTokens.surface,
  },
  // `light` é o fundo da etiqueta e `main` o texto sobre ele — mesmo contrato
  // do tema claro, com o par invertido para continuar legível no escuro.
  success: { light: darkColorTokens.successTagBackground, main: darkColorTokens.successTagText },
  warning: { light: darkColorTokens.warningTagBackground, main: darkColorTokens.warningTagText },
  background: {
    default: darkColorTokens.surface,
    paper: darkColorTokens.surfaceElevated,
  },
  text: {
    primary: darkColorTokens.onSurfaceHigh,
    secondary: darkColorTokens.onSurfaceMedium,
    disabled: darkColorTokens.onSurfaceDisabled,
  },
  action: { hover: darkColorTokens.hover },
  divider: darkColorTokens.divider,
};
