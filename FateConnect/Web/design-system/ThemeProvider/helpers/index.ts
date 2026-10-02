import type { ThemeMode } from '@ds-root/theme';

import type { ThemePreference } from '../@types/themePreference';
import { themeModeStorage } from '../storage/themeModeStorage';

const SYSTEM_PREFERENCE: ThemePreference = 'system';

function isChosenMode(preference: ThemePreference): preference is ThemeMode {
  return preference !== SYSTEM_PREFERENCE;
}

export function storedPreference(): ThemePreference {
  return themeModeStorage.read() ?? SYSTEM_PREFERENCE;
}

export function resolvedMode(preference: ThemePreference, systemPrefersDark: boolean): ThemeMode {
  if (isChosenMode(preference)) return preference;
  if (systemPrefersDark) return 'dark';

  return 'light';
}

/** Seguir o aparelho é não ter escolha guardada: a de quem já escolheu continua valendo. */
export function rememberPreference(preference: ThemePreference): void {
  if (isChosenMode(preference)) {
    themeModeStorage.save(preference);
    return;
  }

  themeModeStorage.clear();
}

/** A barra do navegador e a de status do app instalado leem estas tags, e não o tema. */
export function paintBrowserBars(color: string): void {
  for (const meta of document.querySelectorAll('meta[name="theme-color"]'))
    meta.setAttribute('content', color);
}
