import type { ThemePreference } from '@design-system';
import { ContrastIcon, DarkModeIcon, LightModeIcon } from '@design-system/icons';

import type { ThemeOption } from '../@types';

export const THEME_LABEL = 'Tema';

const OPTION_BY_PREFERENCE: Readonly<Record<ThemePreference, ThemeOption>> = {
  system: { preference: 'system', label: 'Automático', Icon: ContrastIcon },
  light: { preference: 'light', label: 'Claro', Icon: LightModeIcon },
  dark: { preference: 'dark', label: 'Escuro', Icon: DarkModeIcon },
};

/** Na ordem do menu: o automático primeiro, como na referência. */
export const THEME_OPTIONS: ThemeOption[] = Object.values(OPTION_BY_PREFERENCE);

export function optionFor(preference: ThemePreference): ThemeOption {
  return OPTION_BY_PREFERENCE[preference];
}

/** O gatilho diz o que ele escolhe e o que está valendo: "Tema: Claro". */
export function triggerLabel(optionLabel: string): string {
  return `${THEME_LABEL}: ${optionLabel}`;
}
