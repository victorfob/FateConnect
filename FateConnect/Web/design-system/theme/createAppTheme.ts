import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme, type Theme } from '@mui/material/styles';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';

import { fontFamily, mobileMedia, typographyTokens } from '../tokens';
import { components } from './components';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';
import { darkPalette, lightPalette } from './palettes';

declare module '@mui/material/styles' {
  /**
   * `space` e `radius` são chaves **nossas**, não API do MUI. Existem para o
   * estilo ler o helper do tema em vez de importá-lo em cada `styles.ts`.
   *
   * ⛔ Não substituem o `spacing` do MUI, e é de propósito: os componentes dele
   * chamam `theme.spacing(1..3)` esperando o multiplicador de 8px, e trocar a
   * transformação encolheu as gutters do `Toolbar` de 24px para 3px.
   */
  interface Theme {
    space: typeof spacing;
    radius: typeof radius;
  }

  interface ThemeOptions {
    space?: typeof spacing;
    radius?: typeof radius;
  }

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

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
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
      space: spacing,
      radius,
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
