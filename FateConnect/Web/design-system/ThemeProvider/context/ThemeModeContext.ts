import { createContext, useContext } from 'react';

import type { ThemeMode } from '@ds-root/theme';

import type { ThemePreference } from '../@types/themePreference';

type ThemeModeContextValue = {
  /** O tema que está valendo, já resolvido o automático. */
  mode: ThemeMode;
  preference: ThemePreference;
  choosePreference: (preference: ThemePreference) => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const contexto = useContext(ThemeModeContext);
  if (!contexto) throw new Error('useThemeMode precisa estar dentro do ThemeProvider');

  return contexto;
}
