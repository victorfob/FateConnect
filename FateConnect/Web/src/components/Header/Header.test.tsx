import { RouterProvider, createMemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingSection, RoutePath } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';
import { Header } from '.';

type RenderHeaderOptions = { isLoggedIn?: boolean; onMenuClick?: VoidFunction };

function renderHeader({ isLoggedIn, onMenuClick = vi.fn() }: RenderHeaderOptions = {}) {
  const router = createMemoryRouter(
    [
      {
        path: RoutePath.CONTACT,
        element: <Header isLoggedIn={isLoggedIn} onMenuClick={onMenuClick} />,
      },
      { path: RoutePath.LANDING, element: <div>landing</div> },
    ],
    { initialEntries: [RoutePath.CONTACT] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

// O botão de menu só aparece abaixo de 768px, por CSS. O jsdom não avalia media
// query, então ele fica com `display: none` e precisa ser buscado com `hidden`.
describe('Header', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should point the logo to the landing page when logged out', () => {
    renderHeader({ isLoggedIn: false });

    expect(screen.getByRole('link', { name: 'FateConnect' })).toHaveAttribute(
      'href',
      RoutePath.LANDING,
    );
  });

  it('should point the logo to the menu when logged in', () => {
    renderHeader({ isLoggedIn: true });

    expect(screen.getByRole('link', { name: 'FateConnect' })).toHaveAttribute(
      'href',
      RoutePath.MENU,
    );
  });

  it('should show the landing navigation when logged out', () => {
    renderHeader({ isLoggedIn: false });

    ['Serviços', 'Como Funciona', 'Entre em Contato', 'Entrar'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('should show the app navigation when logged in', () => {
    renderHeader({ isLoggedIn: true });

    ['Achados & Perdidos', 'Caronas', 'Entre em Contato'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('should navigate to the landing section when a landing button is clicked', async () => {
    const router = renderHeader({ isLoggedIn: false });

    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
    expect(router.state.location.hash).toBe(`#${LandingSection.SERVICES}`);
  });

  it('should call onMenuClick when the hamburger button is clicked', async () => {
    const onMenuClick = vi.fn();
    renderHeader({ onMenuClick });

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));

    expect(onMenuClick).toHaveBeenCalledOnce();
  });
});
