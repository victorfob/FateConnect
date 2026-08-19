import GlobalStylesBase from '@mui/material/GlobalStyles';

import { colorTokens, fontFamily } from './tokens';

/** Reset mínimo e base tipográfica do documento. */
export function GlobalStyles() {
  return (
    <GlobalStylesBase
      styles={{
        '*, *::before, *::after': { boxSizing: 'border-box' },
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
