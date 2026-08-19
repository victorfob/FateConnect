import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMemo, type ReactNode } from 'react';

import { GlobalStyles } from '../GlobalStyles';
import { createAppTheme } from '../theme';

type ThemeProviderProps = { children: ReactNode };

/** Único ponto onde o tema é criado e injetado na árvore. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useMemo(() => createAppTheme(), []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </MuiThemeProvider>
  );
}
