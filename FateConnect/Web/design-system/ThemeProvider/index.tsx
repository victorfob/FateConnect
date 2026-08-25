import { useCallback, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { GlobalStyles } from '../GlobalStyles';
import { createAppTheme, type ThemeMode } from '../theme';
import { ThemeModeContext } from './context/ThemeModeContext';

type ThemeProviderProps = Readonly<{
  children: ReactNode;
  defaultMode?: ThemeMode;
}>;

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const toggleMode = useCallback(() => {
    setMode((atual) => (atual === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const contexto = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={contexto}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
