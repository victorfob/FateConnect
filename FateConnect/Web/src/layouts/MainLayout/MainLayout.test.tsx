import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, within } from '@app/test/testing-library';
import { MainLayout } from '.';

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <MainLayout />,
        children: [
          { path: RoutePathEnum.MENU, element: <div>menu</div> },
          { path: RoutePathEnum.RIDES, element: <div>caronas</div> },
        ],
      },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

// O botão de menu só aparece abaixo de 768px, por CSS. O jsdom não avalia media
// query, então ele fica com `display: none` e precisa ser buscado com `hidden`.
describe('MainLayout', () => {
  it('should render the logged header and the footer around the routed content', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'Caronas' })).toBeInTheDocument();
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entre em contato' })).toBeInTheDocument();
  });

  it('should navigate from a drawer item and close the drawer', async () => {
    const router = renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));

    const drawer = screen.getByRole('presentation');
    await userEvent.click(within(drawer).getByRole('link', { name: 'Caronas' }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES);
  });

  it('should show the initials of the logged user', () => {
    tokenStorage.save('token-de-teste', 'Maria da Silva');
    renderLayout();

    expect(screen.getByRole('img', { name: 'Maria da Silva' })).toHaveTextContent('MS');
  });

  it('should not show the avatar when no name is stored', () => {
    renderLayout();

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should point the logo to the menu', () => {
    renderLayout();

    expect(screen.getAllByRole('link', { name: 'FateConnect' })[0]).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });
});
