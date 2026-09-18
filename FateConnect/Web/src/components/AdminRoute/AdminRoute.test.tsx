import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { ProfileTypeEnum } from '@app/services/auth/types';
import { render, screen, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { AdminRoute } from '.';

const GUARDED_TEXT = 'área de gestão';

function renderGuarded() {
  const router = createMemoryRouter(
    [
      {
        element: <AdminRoute />,
        children: [{ path: RoutePathEnum.MANAGEMENT, element: <div>{GUARDED_TEXT}</div> }],
      },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.MANAGEMENT] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('AdminRoute', () => {
  it('should let an administrator through', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.ADMINISTRATOR));

    renderGuarded();

    expect(await screen.findByText(GUARDED_TEXT)).toBeInTheDocument();
  });

  it('should send an operator back to the menu', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.OPERATOR));

    const router = renderGuarded();

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(screen.queryByText(GUARDED_TEXT)).not.toBeInTheDocument();
  });

  it('should send back whoever carries a token with no profile at all', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    const router = renderGuarded();

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
  });
});
