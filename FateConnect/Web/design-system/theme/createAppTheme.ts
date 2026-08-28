import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme, type Theme } from '@mui/material/styles';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';

import { DESKTOP_MIN_WIDTH_PX, fontFamily, typographyTokens } from '../tokens';
import { components } from './components';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';
import { darkPalette, lightPalette } from './palettes';
import type { ChromeColors, NotificationVariant, StatusTagTone, SurfacePair } from './types';

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

  /**
   * Cores que variam entre os temas e não têm slot no MUI. Cada paleta as
   * declara uma vez e o consumidor **lê** — cor nova que muda com o tema entra
   * aqui, nunca como função que ramifica no modo.
   */
  interface Palette {
    brandText: string;
    chrome: ChromeColors;
    inputOutline: string;
    skeleton: string;
    statusTag: Record<StatusTagTone, SurfacePair>;
    notification: Record<NotificationVariant, SurfacePair>;
  }

  interface PaletteOptions {
    brandText: string;
    chrome: ChromeColors;
    inputOutline: string;
    skeleton: string;
    statusTag: Record<StatusTagTone, SurfacePair>;
    notification: Record<NotificationVariant, SurfacePair>;
  }

  interface TypographyVariants {
    body: React.CSSProperties;
    subtitle: React.CSSProperties;
    subtitleBold: React.CSSProperties;
    captionBold: React.CSSProperties;
    logo: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body?: React.CSSProperties;
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
    body: true;
    subtitle: true;
    subtitleBold: true;
    captionBold: true;
    logo: true;
  }
}

/**
 * A tipografia é declarada **dentro** do `createTheme`, onde `theme` ainda não
 * existe — daí a consulta escrita à mão. O meio centésimo reproduz exatamente o
 * que `theme.breakpoints.down('md')` gera, e há teste travando a igualdade.
 */
/** O passo que o `down` do MUI subtrai para as duas consultas não se sobreporem. */
const BREAKPOINT_STEP_PX = 0.05;
const MOBILE_MEDIA = `@media (max-width:${DESKTOP_MIN_WIDTH_PX - BREAKPOINT_STEP_PX}px)`;

export type ThemeMode = 'light' | 'dark';

export function createAppTheme(mode: ThemeMode = 'light'): Theme {
  return createTheme(
    {
      components,
      // Só o `md` muda: é o limite entre mobile e desktop do produto. Os demais
      // ficam nos valores do MUI, porque `Toolbar` e `Dialog` leem o `sm`.
      breakpoints: { values: { xs: 0, sm: 600, md: DESKTOP_MIN_WIDTH_PX, lg: 1200, xl: 1536 } },
      space: spacing,
      radius,
      palette: mode === 'dark' ? darkPalette : lightPalette,
      typography: {
        fontFamily,
        // O ponto de virada é o do produto (768px), não o `sm` do MUI (600px):
        // entre os dois o título ficava grande enquanto o produto já reduzia.
        h1: {
          ...typographyTokens.h1,
          [MOBILE_MEDIA]: typographyTokens.h1Narrow,
        },
        h2: typographyTokens.h2,
        body: typographyTokens.body,
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
