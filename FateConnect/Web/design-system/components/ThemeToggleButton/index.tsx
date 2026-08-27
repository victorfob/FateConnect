import { IconButton } from '@ds-root/components/IconButton';
import { DarkModeIcon, LightModeIcon } from '@ds-root/icons';
import { useThemeMode } from '@ds-root/ThemeProvider/context/ThemeModeContext';

const SWITCH_TO_DARK_LABEL = 'Ativar tema escuro';
const SWITCH_TO_LIGHT_LABEL = 'Ativar tema claro';

export function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const isLightMode = mode === 'light';

  return (
    <IconButton
      color="inherit"
      label={isLightMode ? SWITCH_TO_DARK_LABEL : SWITCH_TO_LIGHT_LABEL}
      onClick={toggleMode}
    >
      {/* O ícone mostra o modo atual; o rótulo descreve a ação do clique. */}
      {isLightMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
