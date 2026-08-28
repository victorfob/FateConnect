import type { PaletteOptions } from '@mui/material/styles';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';

const NO_SURFACE = 'transparent';
const INHERITED_CONTENT = 'inherit';

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
  brandText: colorTokens.accent,
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
  chrome: {
    main: colorTokens.primary,
    contrastText: colorTokens.textOnAccent,
    divider: colorTokens.chromeDivider,
    hover: colorTokens.chromeHover,
  },
  /**
   * Borda do campo de formulário. O padrão do MUI é mais claro que o do produto
   * (23% contra 38%), o que deixaria todo formulário mais lavado que hoje.
   */
  inputOutline: colorTokens.inputOutline,
  skeleton: colorTokens.skeleton,
  statusTag: {
    neutral: { surface: NO_SURFACE, content: INHERITED_CONTENT },
    muted: { surface: colorTokens.mutedBackground, content: colorTokens.mutedText },
    success: { surface: colorTokens.successBackground, content: colorTokens.successText },
    warning: { surface: colorTokens.warningBackground, content: colorTokens.warningText },
    // O vermelho do produto não passa AA sobre o pastel; o mesmo escurecido passa.
    danger: { surface: colorTokens.dangerBackground, content: colorVariants.secondaryDark },
  },
  /**
   * No produto o fundo do aviso é pastel por estado e o texto é sempre o cinza
   * apagado — nada de fundo saturado com texto branco, que é o padrão da
   * biblioteca. O cinza apagado, porém, não alcança AA sobre esses pastéis, então
   * cada variante usa a própria cor de estado, como a etiqueta já faz.
   */
  notification: {
    success: { surface: colorTokens.successBackground, content: colorTokens.successText },
    error: { surface: colorTokens.dangerBackground, content: colorVariants.secondaryDark },
    warning: { surface: colorTokens.warningBackground, content: colorTokens.warningText },
  },
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: darkColorTokens.primary,
    contrastText: darkColorTokens.surface,
  },
  secondary: {
    main: darkColorTokens.secondary,
    contrastText: colorTokens.surfaceWhite,
  },
  brandText: darkColorTokens.brandText,
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
  /**
   * No escuro o cromo é a superfície elevada, não a cor de marca: o sistema de
   * cor do Material Design pede superfície neutra em área grande, onde marca
   * saturada cansa a vista e reduz a hierarquia.
   */
  chrome: {
    main: darkColorTokens.surfaceElevated,
    contrastText: darkColorTokens.onSurfaceHigh,
    divider: darkColorTokens.divider,
    hover: darkColorTokens.hover,
  },
  /** 38% de branco é a ênfase desabilitada do sistema de cor do Material Design. */
  inputOutline: darkColorTokens.onSurfaceDisabled,
  skeleton: darkColorTokens.skeleton,
  // No escuro o par da etiqueta e o do aviso invertem de claridade, não de papel.
  statusTag: {
    neutral: { surface: NO_SURFACE, content: INHERITED_CONTENT },
    muted: { surface: darkColorTokens.mutedTagBackground, content: darkColorTokens.mutedTagText },
    success: {
      surface: darkColorTokens.successTagBackground,
      content: darkColorTokens.successTagText,
    },
    warning: {
      surface: darkColorTokens.warningTagBackground,
      content: darkColorTokens.warningTagText,
    },
    danger: {
      surface: darkColorTokens.dangerTagBackground,
      content: darkColorTokens.dangerTagText,
    },
  },
  notification: {
    success: {
      surface: darkColorTokens.successTagBackground,
      content: darkColorTokens.successTagText,
    },
    error: { surface: darkColorTokens.dangerTagBackground, content: darkColorTokens.dangerTagText },
    warning: {
      surface: darkColorTokens.warningTagBackground,
      content: darkColorTokens.warningTagText,
    },
  },
};
