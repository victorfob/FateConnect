import type { ThemeMode } from '@ds-root/theme';

const THEME_MODE_KEY = 'theme_mode';

const THEME_MODES: ReadonlySet<string> = new Set<ThemeMode>(['light', 'dark']);

function isThemeMode(value: string | null): value is ThemeMode {
  if (value === null) return false;

  return THEME_MODES.has(value);
}

/**
 * Único ponto que fala com o armazenamento do navegador sobre o tema, na mesma
 * convenção do armazenamento de sessão da aplicação.
 */
export const themeModeStorage = {
  read(): ThemeMode | null {
    const stored = window.localStorage.getItem(THEME_MODE_KEY);
    if (isThemeMode(stored)) return stored;

    return null;
  },

  save(mode: ThemeMode): void {
    window.localStorage.setItem(THEME_MODE_KEY, mode);
  },
};
