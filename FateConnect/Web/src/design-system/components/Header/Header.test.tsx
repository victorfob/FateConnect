import { describe, expect, it, vi } from 'vitest';

import { render, screen, userEvent } from '@app/test/testing-library';
import { Header } from '.';

const MENU_LABEL = 'Abrir menu';

// O botão de menu só aparece abaixo de 768px, por CSS. O jsdom não avalia media
// query, então ele fica com `display: none` e precisa ser buscado com `hidden`.
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
});
