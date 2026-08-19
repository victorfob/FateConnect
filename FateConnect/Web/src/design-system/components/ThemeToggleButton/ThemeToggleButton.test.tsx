import { describe, expect, it } from 'vitest';

import { render, screen, userEvent } from '@app/test/testing-library';
import { ThemeToggleButton } from '.';

const PARA_ESCURO = 'Ativar tema escuro';
const PARA_CLARO = 'Ativar tema claro';

/** Lê a cor de fundo aplicada pelo tema ao corpo do documento. */
function fundoDoDocumento() {
  return getComputedStyle(document.body).backgroundColor;
}

describe('ThemeToggleButton', () => {
  it('should offer the dark theme while the light one is active', () => {
    render(<ThemeToggleButton />);

    expect(screen.getByRole('button', { name: PARA_ESCURO })).toBeInTheDocument();
  });

  it('should show an icon that reflects the active mode', async () => {
    render(<ThemeToggleButton />);

    // Modo claro: sol. O ícone mostra o modo atual, não o destino do clique.
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PARA_ESCURO }));

    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
  });

  it('should switch the theme and flip its own label when clicked', async () => {
    render(<ThemeToggleButton />);
    const fundoClaro = fundoDoDocumento();

    await userEvent.click(screen.getByRole('button', { name: PARA_ESCURO }));

    expect(screen.getByRole('button', { name: PARA_CLARO })).toBeInTheDocument();
    expect(fundoDoDocumento()).not.toBe(fundoClaro);
  });

  it('should return to the light theme on a second click', async () => {
    render(<ThemeToggleButton />);
    const fundoClaro = fundoDoDocumento();

    await userEvent.click(screen.getByRole('button', { name: PARA_ESCURO }));
    await userEvent.click(screen.getByRole('button', { name: PARA_CLARO }));

    expect(fundoDoDocumento()).toBe(fundoClaro);
  });
});
