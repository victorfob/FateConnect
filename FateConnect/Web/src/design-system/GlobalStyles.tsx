import GlobalStylesBase from '@mui/material/GlobalStyles';

import { colorTokens, fontFamily } from './tokens';

/** Reset mínimo e base tipográfica do documento. */
export function GlobalStyles() {
  return (
    <GlobalStylesBase
      styles={{
        // Mesmo reset do produto: zera margem e recuo de todo elemento.
        '*, *::before, *::after': { boxSizing: 'border-box', margin: 0, padding: 0 },
        html: { scrollBehavior: 'smooth' },
        // Compensa o topo fixo ao rolar até uma seção pelo fragmento da URL.
        '[id]': { scrollMarginTop: '5rem' },
        'html, body, #root': { height: '100%' },
        body: {
          margin: 0,
          fontFamily,
          color: colorTokens.primary,
          backgroundColor: colorTokens.surfaceGray,
          WebkitFontSmoothing: 'antialiased',
        },
        'a, button': { fontFamily },
      }}
    />
  );
}
