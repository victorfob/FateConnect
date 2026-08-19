import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme, type Theme } from '@mui/material/styles';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';

import { fontFamily, typographyTokens } from '../tokens';
import { darkPalette, lightPalette } from './palettes';
import { components } from './components';

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

export type ThemeMode = 'light' | 'dark';

/** Modo claro é o padrão; o escuro segue o sistema de cor do Material Design. */
export function createAppTheme(mode: ThemeMode = 'light'): Theme {
  const base = createTheme();

  return createTheme(
    {
      components,
      palette: mode === 'dark' ? darkPalette : lightPalette,
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
