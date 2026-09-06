import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import * as C from './constants';
import { AccountMenu } from '.';

const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';
const NO_CONTENT = 204;
const SERVER_ERROR = 500;

const USER_NAME = 'Maria da Silva';

function renderMenu() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MENU, element: <AccountMenu /> },
      { path: RoutePathEnum.PROFILE, element: <div>perfil</div> },
      { path: RoutePathEnum.PREFERENCES, element: <div>preferências</div> },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

async function openMenu() {
  await userEvent.click(screen.getByRole('button', { name: C.TRIGGER_LABEL }));
}

describe('AccountMenu', () => {
  beforeEach(() => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    tokenStorage.save(tokenWithName(USER_NAME));
  });

  it('should show the avatar as the trigger of the account menu', () => {
    renderMenu();

    expect(screen.getByRole('button', { name: C.TRIGGER_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: USER_NAME })).toHaveTextContent('MS');
  });

  it('should render nothing when the token carries no name', () => {
    tokenStorage.clear();

    renderMenu();

    expect(screen.queryByRole('button', { name: C.TRIGGER_LABEL })).not.toBeInTheDocument();
  });

  it('should open a panel named after the account, with the three items', async () => {
    renderMenu();

    await openMenu();

    const panel = screen.getByRole('dialog', { name: C.panelLabel(USER_NAME) });

    expect(panel).toBeInTheDocument();
    C.ACCOUNT_LINKS.forEach(({ label }) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: C.SIGN_OUT_LABEL })).toBeInTheDocument();
  });

  it.each(C.ACCOUNT_LINKS)(
    'should navigate to $path and close the panel',
    async ({ label, path }) => {
      const router = renderMenu();
      await openMenu();

      await userEvent.click(screen.getByRole('link', { name: label }));

      expect(router.state.location.pathname).toBe(path);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    },
  );

  it('should close on Escape and give the focus back to the trigger', async () => {
    renderMenu();
    await openMenu();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: C.TRIGGER_LABEL })).toHaveFocus();
  });

  it('should end the session as soon as the sign out item is used', async () => {
    renderMenu();
    await openMenu();

    await userEvent.click(screen.getByRole('button', { name: C.SIGN_OUT_LABEL }));

    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should end the session even when the logout request fails', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    renderMenu();
    await openMenu();

    await userEvent.click(screen.getByRole('button', { name: C.SIGN_OUT_LABEL }));

    expect(tokenStorage.getToken()).toBeNull();
  });
});
