import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { MainLayout } from '.';

function renderLayout(initialEntry: RoutePathEnum = RoutePathEnum.MENU) {
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
    { initialEntries: [initialEntry] },
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
    tokenStorage.save(tokenWithName('Maria da Silva'));
    renderLayout();

    expect(screen.getByRole('img', { name: 'Maria da Silva' })).toHaveTextContent('MS');
  });

  it('should not show the avatar when no name comes in the token', () => {
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

  it('should navigate and close the drawer when the logo inside it is used', async () => {
    const router = renderLayout(RoutePathEnum.RIDES);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));

    const drawer = screen.getByRole('presentation');
    await userEvent.click(within(drawer).getByRole('link', { name: 'FateConnect' }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.MENU);
    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument());
  });

  it('should mark the current screen in the header and in the drawer', async () => {
    renderLayout(RoutePathEnum.RIDES);

    expect(screen.getByRole('link', { name: 'Caronas' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Achados & Perdidos' })).not.toHaveAttribute(
      'aria-current',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));
    const drawer = screen.getByRole('presentation');

    expect(within(drawer).getByRole('link', { name: 'Caronas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(drawer).getByRole('link', { name: 'Achados & Perdidos' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
