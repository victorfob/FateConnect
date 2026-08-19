import IconButton from '@mui/material/IconButton';

import { useThemeMode } from '../../ThemeProvider/ThemeModeContext';
import { DarkModeIcon, LightModeIcon } from '../../ui';

const LABEL_PARA_ESCURO = 'Ativar tema escuro';
const LABEL_PARA_CLARO = 'Ativar tema claro';

/** Alterna entre o tema claro e o escuro. */
export function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const estaClaro = mode === 'light';

  return (
    <IconButton
      color="inherit"
      aria-label={estaClaro ? LABEL_PARA_ESCURO : LABEL_PARA_CLARO}
      onClick={toggleMode}
    >
      {/* O ícone mostra o modo atual; o rótulo descreve a ação do clique. */}
      {estaClaro ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
