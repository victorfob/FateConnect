import Button from '@mui/material/Button';

import { render, screen, userEvent } from '@app/test/testing-library';
import { createAppTheme } from '@ds-root/theme';

import { Header } from '.';

const MENU_LABEL = 'Abrir menu';
const TEXT_BUTTON_LABEL = 'destino';
const FILLED_BUTTON_LABEL = 'Entrar';
const CHROME_TEXT = createAppTheme('light').palette.chrome.contrastText;

function renderWithBothButtons() {
  render(
    <Header
      logo={<span>marca</span>}
      navigation={
        <>
          <Button variant="text">{TEXT_BUTTON_LABEL}</Button>
          <Button variant="contained" color="secondary">
            {FILLED_BUTTON_LABEL}
          </Button>
        </>
      }
      onMenuClick={vi.fn()}
      menuButtonLabel={MENU_LABEL}
    />,
  );
}

function colourOf(label: string) {
  return getComputedStyle(screen.getByRole('button', { name: label })).color;
}

// O botão de menu só aparece abaixo do limite do cabeçalho, por CSS. O jsdom não
// avalia media query: ele fica com `display: none` e é buscado com `hidden`.
describe('Header', () => {
  it('should render the logo and the navigation slots', () => {
    render(
      <Header
        logo={<span>marca</span>}
        navigation={<button type="button">destino</button>}
        onMenuClick={vi.fn()}
        menuButtonLabel={MENU_LABEL}
      />,
    );

    expect(screen.getByText('marca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'destino' })).toBeInTheDocument();
  });

  /**
   * ⛔ O branco a 90% do cromo sobre o vermelho de botão reprova no contraste de
   * texto. O par nasce desta sobrescrita de CSS e não existe na paleta, então
   * nenhum teste de contraste o alcança: só este caso o guarda.
   */
  it('should leave the filled button out of the chrome colour, which fails AA over its own fill', () => {
    renderWithBothButtons();

    // O de texto é o controle: sem ele, a negativa abaixo passaria mesmo se a
    // regra tivesse deixado de aplicar a qualquer botão.
    expect(colourOf(TEXT_BUTTON_LABEL)).toBe(CHROME_TEXT);
    expect(colourOf(FILLED_BUTTON_LABEL)).not.toBe(CHROME_TEXT);
  });

  it('should call onMenuClick when the menu button is clicked', async () => {
    const onMenuClick = vi.fn();
    render(
      <Header
        logo={null}
        navigation={null}
        onMenuClick={onMenuClick}
        menuButtonLabel={MENU_LABEL}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: MENU_LABEL, hidden: true }));

    expect(onMenuClick).toHaveBeenCalledOnce();
  });

  it('should pull the menu button over the bar padding, so the icon lines up with the content', () => {
    render(
      <Header logo={null} navigation={null} onMenuClick={vi.fn()} menuButtonLabel={MENU_LABEL} />,
    );

    const menuButton = screen.getByRole('button', { name: MENU_LABEL, hidden: true });

    // A folga do botão em volta do desenho é o que deixava o ícone mais para dentro.
    expect(Number.parseFloat(getComputedStyle(menuButton).marginRight)).toBeLessThan(0);
  });
});
