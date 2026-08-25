import { createContext, useContext } from 'react';

import type { ThemeMode } from '@ds-root/theme';

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: VoidFunction;
};

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/** Modo de tema corrente e a ação de alternar. Só funciona sob o `ThemeProvider`. */
export function useThemeMode(): ThemeModeContextValue {
  const contexto = useContext(ThemeModeContext);
  if (!contexto) throw new Error('useThemeMode precisa estar dentro do ThemeProvider');

  return contexto;
}
