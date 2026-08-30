import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { DESCRIPTION_TITLE } from '@app/pages/Home/components/LandingDescription/constants';
import { LOST_AND_FOUND_TITLE } from '@app/pages/LostAndFound/constants';
import { MENU_TITLE } from '@app/pages/Menu/constants';
import { RIDES_TITLE } from '@app/pages/Rides/constants';
import { SIGNUP_TITLE } from '@app/pages/Signup/constants';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { RoutePathEnum } from './paths';
import { routeConfig } from './routeConfig';

function renderRoute(initialPath: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('routeConfig', () => {
  // Caronas e achados e perdidos listam assim que montam.
  beforeEach(() => {
    server.use(
      http.get('https://api.fateconnect.test/rides', () => HttpResponse.json([])),
      http.get('https://api.fateconnect.test/achado', () => HttpResponse.json([])),
    );
  });

  // Dentro de `main`: o título da tela vive na área de conteúdo, não no cromo.
  // Buscar na página toda casaria com um título do rodapé de mesmo texto.
  async function expectTitle(title: string) {
    expect(
      within(await screen.findByRole('main')).getByRole('heading', { name: title }),
    ).toBeInTheDocument();
  }

  it.each([
    [RoutePathEnum.LANDING, DESCRIPTION_TITLE],
    [RoutePathEnum.SIGNUP, SIGNUP_TITLE],
  ])('should resolve %s without a session', async (path, title) => {
    renderRoute(path);

    await expectTitle(title);
  });

  it.each([
    [RoutePathEnum.MENU, MENU_TITLE],
    [RoutePathEnum.LOST_AND_FOUND, LOST_AND_FOUND_TITLE],
    [RoutePathEnum.RIDES, RIDES_TITLE],
  ])('should resolve %s with a session', async (path, title) => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    renderRoute(path);

    await expectTitle(title);
  });

  it.each([
    ['the root path', RoutePathEnum.ROOT],
    ['an unknown route', '/rota-que-nao-existe'],
  ])('should send %s to the menu when there is a session', async (_name, from) => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    const router = createMemoryRouter(routeConfig, { initialEntries: [from] });
    render(<RouterProvider router={router} />);

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
  });

  it('should redirect the root path to the landing page', () => {
    const router = renderRoute(RoutePathEnum.ROOT);

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  // A raiz fica fora deste grupo de propósito: ela é redirecionamento explícito
  // de índice, e continuaria passando com o curinga quebrado.
  it.each([
    ['a dropped rides sub-route', '/caronas/ofertar'],
    ['a dropped route', '/contato'],
    ['an unknown route', '/rota-que-nao-existe'],
  ])('should send %s to the landing page', (_name, path) => {
    const router = renderRoute(path);

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });
});
