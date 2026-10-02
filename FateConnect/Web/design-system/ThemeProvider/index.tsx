import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { GlobalStyles } from '../GlobalStyles';
import { createAppTheme } from '../theme';
import type { ThemePreference } from './@types/themePreference';
import { ThemeModeContext } from './context/ThemeModeContext';
import { paintBrowserBars, rememberPreference, resolvedMode, storedPreference } from './helpers';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

type ThemeProviderProps = Readonly<{ children: ReactNode }>;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(storedPreference);
  const systemPrefersDark = useMediaQuery(SYSTEM_DARK_QUERY, { noSsr: true });
  const mode = resolvedMode(preference, systemPrefersDark);

  const choosePreference = useCallback((chosen: ThemePreference) => {
    rememberPreference(chosen);
    setPreference(chosen);
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const themeMode = useMemo(
    () => ({ mode, preference, choosePreference }),
    [mode, preference, choosePreference],
  );

  useEffect(() => paintBrowserBars(theme.palette.chrome.main), [theme]);

  return (
    <ThemeModeContext.Provider value={themeMode}>
      <MuiThemeProvider theme={theme}>
        {/*
          Sem a prop o `CssBaseline` não declara `color-scheme`, e o Chrome
          desenha todo controle nativo no claro por mais escuro que o tema seja.
        */}
        <CssBaseline enableColorScheme />
        <GlobalStyles />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
