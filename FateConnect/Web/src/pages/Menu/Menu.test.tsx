import { createMemoryRouter, RouterProvider } from 'react-router';

import { APP_LINKS, MANAGEMENT_LINK } from '@app/constants/navigation';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { ProfileTypeEnum } from '@app/services/auth/types';
import { render, screen, userEvent } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

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

    expect(links.map((link) => link.textContent)).toEqual(APP_LINKS.map(({ label }) => label));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      APP_LINKS.map(({ path }) => path),
    );
  });

  it('should keep the management card out of an operator menu', () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.OPERATOR));

    renderComponent();

    expect(screen.queryByRole('link', { name: MANAGEMENT_LINK.label })).not.toBeInTheDocument();
  });

  it('should navigate to the service the user picks', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: 'Caronas' }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES);
  });
});

describe('Menu, for an administrator', () => {
  it('should offer the management card after the services, which an operator never sees', () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.ADMINISTRATOR));

    renderComponent();

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      ...APP_LINKS.map(({ label }) => label),
      MANAGEMENT_LINK.label,
    ]);
  });
});
