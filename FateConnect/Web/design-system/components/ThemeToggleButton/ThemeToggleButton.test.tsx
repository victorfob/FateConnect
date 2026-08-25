import { render, screen, userEvent } from '@app/test/testing-library';

import { ThemeToggleButton } from '.';

const SWITCH_TO_DARK = 'Ativar tema escuro';
const SWITCH_TO_LIGHT = 'Ativar tema claro';

/** Lê a cor de fundo aplicada pelo tema ao corpo do documento. */
function documentBackground() {
  return getComputedStyle(document.body).backgroundColor;
}

describe('ThemeToggleButton', () => {
  it('should offer the dark theme while the light one is active', () => {
    render(<ThemeToggleButton />);

    expect(screen.getByRole('button', { name: SWITCH_TO_DARK })).toBeInTheDocument();
  });

  it('should show an icon that reflects the active mode', async () => {
    render(<ThemeToggleButton />);

    // Modo claro: sol. O ícone mostra o modo atual, não o destino do clique.
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: SWITCH_TO_DARK }));

    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
  });

  it('should switch the theme and flip its own label when clicked', async () => {
    render(<ThemeToggleButton />);
    const lightBackground = documentBackground();

    await userEvent.click(screen.getByRole('button', { name: SWITCH_TO_DARK }));

    expect(screen.getByRole('button', { name: SWITCH_TO_LIGHT })).toBeInTheDocument();
    expect(documentBackground()).not.toBe(lightBackground);
  });

  it('should return to the light theme on a second click', async () => {
    render(<ThemeToggleButton />);
    const lightBackground = documentBackground();

    await userEvent.click(screen.getByRole('button', { name: SWITCH_TO_DARK }));
    await userEvent.click(screen.getByRole('button', { name: SWITCH_TO_LIGHT }));

    expect(documentBackground()).toBe(lightBackground);
  });
});
