import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { LOGIN_CARD_TITLE } from '@app/pages/Home/components/LandingLoginCard/constants';
import { MENU_TITLE } from '@app/pages/Menu/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { routeConfig } from '@app/routes/routeConfig';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

const SESSION_URL = 'https://api.fateconnect.test/auth/session';
const UNAUTHORIZED = 401;

function renderLanding() {
  const router = createMemoryRouter(routeConfig, { initialEntries: [RoutePathEnum.LANDING] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('VisitorRoute', () => {
  it('should send whoever already has a session to the menu', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    const router = renderLanding();

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(await screen.findByRole('heading', { name: MENU_TITLE })).toBeInTheDocument();
  });

  it('should leave the visitor where they are after a refused session', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    server.use(http.get(SESSION_URL, () => new HttpResponse(null, { status: UNAUTHORIZED })));

    const router = renderLanding();

    expect(await screen.findByRole('heading', { name: LOGIN_CARD_TITLE })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });
});
