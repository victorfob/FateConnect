import GlobalStylesBase from '@mui/material/GlobalStyles';

import { fontFamily, spacingScale } from './tokens';

const { none, huge } = spacingScale;

export function GlobalStyles() {
  return (
    <GlobalStylesBase
      styles={(theme) => ({
        '*, *::before, *::after': {
          boxSizing: 'border-box',
          margin: theme.space(none),
          padding: theme.space(none),
        },
        html: { scrollBehavior: 'smooth' },
        // Compensa o topo fixo ao rolar até uma seção pelo fragmento da URL.
        '[id]': { scrollMarginTop: theme.space(huge) },
        'html, body, #root': { height: '100%' },
        body: {
          margin: theme.space(none),
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
