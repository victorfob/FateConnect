import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme, type Theme } from '@mui/material/styles';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';

import { colorTokens, fontFamily, typographyTokens } from '../tokens';
import { components } from './components';
import { spacing } from './helpers/spacing';

/** Acima deste ponto o `h1` usa o tamanho cheio; abaixo, o reduzido. */
const NARROW_BREAKPOINT = 'sm';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    subtitle: React.CSSProperties;
    subtitleBold: React.CSSProperties;
    captionBold: React.CSSProperties;
    logo: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    subtitle?: React.CSSProperties;
    subtitleBold?: React.CSSProperties;
    captionBold?: React.CSSProperties;
    logo?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    subtitle: true;
    subtitleBold: true;
    captionBold: true;
    logo: true;
  }
}

export function createAppTheme(): Theme {
  const base = createTheme();

  return createTheme(
    {
      spacing,
      components,
      palette: {
        primary: { main: colorTokens.primary, contrastText: colorTokens.textOnAccent },
        secondary: { main: colorTokens.accent, contrastText: colorTokens.textOnAccent },
        error: { main: colorTokens.dangerText },
        success: { main: colorTokens.successText },
        warning: { main: colorTokens.warningText },
        background: { default: colorTokens.surfaceGray, paper: colorTokens.surfaceWhite },
        text: { primary: colorTokens.primary, secondary: colorTokens.textMuted },
        divider: colorTokens.divider,
      },
      typography: {
        fontFamily,
        h1: {
          ...typographyTokens.h1,
          [base.breakpoints.down(NARROW_BREAKPOINT)]: typographyTokens.h1Narrow,
        },
        h2: typographyTokens.h2,
        subtitle: typographyTokens.subtitle,
        subtitleBold: typographyTokens.subtitleBold,
        caption: typographyTokens.caption,
        captionBold: typographyTokens.captionBold,
        logo: typographyTokens.logo,
      },
    },
    corePtBR,
    pickersPtBR,
  );
}
