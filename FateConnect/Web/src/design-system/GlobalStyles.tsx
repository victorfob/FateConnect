import GlobalStylesBase from '@mui/material/GlobalStyles';

import { fontFamily } from './tokens';

/** Reset mínimo e base tipográfica do documento. */
export function GlobalStyles() {
  return (
    <GlobalStylesBase
      styles={(theme) => ({
        // Mesmo reset do produto: zera margem e recuo de todo elemento.
        '*, *::before, *::after': { boxSizing: 'border-box', margin: 0, padding: 0 },
        html: { scrollBehavior: 'smooth' },
        // Compensa o topo fixo ao rolar até uma seção pelo fragmento da URL.
        '[id]': { scrollMarginTop: '5rem' },
        'html, body, #root': { height: '100%' },
        body: {
          margin: 0,
          // O CssBaseline do MUI aplica `antialiased`, que afina o texto. O produto
          // usa o padrão do navegador — sem isso, todo peso parece um grau menor.
          WebkitFontSmoothing: 'auto',
          MozOsxFontSmoothing: 'auto',
          fontFamily,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.default,
        },
        'a, button': { fontFamily },
      })}
    />
  );
}
