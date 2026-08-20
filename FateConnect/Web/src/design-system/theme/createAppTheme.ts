import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme, type Theme } from '@mui/material/styles';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';

import { fontFamily, mobileMedia, typographyTokens } from '../tokens';
import { darkPalette, lightPalette } from './palettes';
import { components } from './components';

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
  return createTheme(
    {
      components,
      palette: mode === 'dark' ? darkPalette : lightPalette,
      typography: {
        fontFamily,
        // O ponto de virada é o do produto (768px), não o `sm` do MUI (600px):
        // entre os dois o título ficava grande enquanto o produto já reduzia.
        h1: {
          ...typographyTokens.h1,
          [mobileMedia]: typographyTokens.h1Narrow,
        },
        h2: typographyTokens.h2,
        subtitle: typographyTokens.subtitle,
        subtitleBold: typographyTokens.subtitleBold,
        caption: typographyTokens.caption,
        captionBold: typographyTokens.captionBold,
        logo: typographyTokens.logo,
        button: typographyTokens.button,
      },
    },
    corePtBR,
    pickersPtBR,
  );
}
