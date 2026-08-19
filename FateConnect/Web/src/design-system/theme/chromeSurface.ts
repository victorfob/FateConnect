import type { Theme } from '@mui/material/styles';

import { colorTokens, darkColorTokens } from '../tokens';

/**
 * Cor de fundo do cromo da aplicação — topo, rodapé e menu lateral.
 *
 * No tema claro é a cor de marca, como no produto. No escuro, o sistema de cor
 * do Material Design pede superfície neutra elevada em vez da cor de marca:
 * marca saturada em área grande cansa a vista e reduz a hierarquia.
 */
export function chromeSurface(theme: Theme): string {
  if (theme.palette.mode === 'dark') return theme.palette.background.paper;

  return theme.palette.primary.main;
}

/**
 * Cor do conteúdo sobre o cromo. Acompanha `chromeSurface`: no claro é o texto
 * sobre a cor de marca; no escuro, o texto de alta ênfase sobre superfície.
 */
export function onChromeSurface(theme: Theme): string {
  if (theme.palette.mode === 'dark') return theme.palette.text.primary;

  return theme.palette.primary.contrastText;
}

/**
 * Cor do divisor desenhado sobre o cromo. `theme.palette.divider` é o divisor
 * de superfície neutra; sobre a cor de marca ele desapareceria, então o cromo
 * usa uma linha clara no tema claro e a mesma do tema escuro no escuro.
 */
export function chromeDivider(theme: Theme): string {
  if (theme.palette.mode === 'dark') return darkColorTokens.divider;

  return colorTokens.chromeDivider;
}
