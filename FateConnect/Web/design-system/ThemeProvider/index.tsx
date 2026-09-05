import { useCallback, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { GlobalStyles } from '../GlobalStyles';
import { createAppTheme, type ThemeMode } from '../theme';
import { ThemeModeContext } from './context/ThemeModeContext';
import { themeModeStorage } from './storage/themeModeStorage';

type ThemeProviderProps = Readonly<{
  children: ReactNode;
  defaultMode?: ThemeMode;
}>;

function oppositeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'light') return 'dark';
  return 'light';
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => themeModeStorage.read() ?? defaultMode);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const chosen = oppositeMode(current);
      themeModeStorage.save(chosen);

      return chosen;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const themeMode = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

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
