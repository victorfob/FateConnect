import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RoutePath } from '@app/routes/paths';
import { render, screen, userEvent, within } from '@app/test/testing-library';
import { MainLayout } from '.';

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <MainLayout />,
        children: [
          { path: RoutePath.MENU, element: <div>menu</div> },
          { path: RoutePath.RIDES, element: <div>caronas</div> },
        ],
      },
    ],
    { initialEntries: [RoutePath.MENU] },
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

    expect(router.state.location.pathname).toBe(RoutePath.RIDES);
  });
});
