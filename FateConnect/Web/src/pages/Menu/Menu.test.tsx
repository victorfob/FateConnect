import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';
import * as C from './constants';
import { Menu } from '.';

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MENU, element: <Menu /> },
      { path: RoutePathEnum.LOST_AND_FOUND, element: <div>achados</div> },
      { path: RoutePathEnum.RIDES, element: <div>caronas</div> },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Menu', () => {
  it('should greet the user and explain what to do next', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.MENU_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.MENU_INTRO)).toBeInTheDocument();
  });

  it('should offer one link per service, in the order of the product', () => {
    renderComponent();

    const links = screen.getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual(
      C.MENU_SERVICES.map(({ label }) => label),
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      C.MENU_SERVICES.map(({ path }) => path),
    );
  });

  it('should navigate to the service the user picks', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: 'Caronas' }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES);
  });
});
