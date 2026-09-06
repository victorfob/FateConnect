import Typography from '@mui/material/Typography';

import { render, screen, userEvent } from '@app/test/testing-library';

import { useThemeMode } from './context/ThemeModeContext';
import { themeModeStorage } from './storage/themeModeStorage';

const PROBE_LABEL = 'Alternar';

/**
 * A sonda vive aqui porque nenhum componente do design system lê o modo: o
 * interruptor mora na tela de preferências, e daqui não se importa de `@app`.
 */
function ModeProbe() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <button aria-label={PROBE_LABEL} onClick={toggleMode}>
      {mode}
    </button>
  );
}

function probe(): HTMLElement {
  return screen.getByRole('button', { name: PROBE_LABEL });
}

describe('ThemeProvider', () => {
  it('should provide the theme to components in the tree', () => {
    render(<Typography variant="logo">FateConnect</Typography>);

    const element = screen.getByText('FateConnect');

    expect(element).toBeInTheDocument();
    expect(getComputedStyle(element).fontSize).toBe('1.3rem');
  });

  it('should open in the mode chosen on the last visit', () => {
    themeModeStorage.save('dark');

    render(<ModeProbe />);

    expect(probe()).toHaveTextContent('dark');
  });

  // Sem esta declaração o Chrome desenha todo controle nativo no claro, por mais
  // escuro que o tema esteja — e nada no produto acusa.
  it('should tell the browser which scheme to draw its own controls in', () => {
    themeModeStorage.save('dark');

    render(<ModeProbe />);

    expect(getComputedStyle(document.documentElement).colorScheme).toBe('dark');
  });

  it('should remember the mode the reader switches to', async () => {
    render(<ModeProbe />);

    await userEvent.click(probe());

    expect(themeModeStorage.read()).toBe('dark');
  });
});
