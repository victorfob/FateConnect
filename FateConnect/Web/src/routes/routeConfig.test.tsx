import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { LOST_AND_FOUND_TITLE } from '@app/pages/LostAndFound/constants';
import { MENU_TITLE } from '@app/pages/Menu/constants';
import { RIDES_TITLE } from '@app/pages/Rides/constants';
import { SIGNUP_TITLE } from '@app/pages/Signup/constants';
import { render, screen, within } from '@app/test/testing-library';

import { RoutePathEnum } from './paths';
import { routeConfig } from './routeConfig';

function renderRoute(initialPath: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('routeConfig', () => {
  // A tela de caronas lista assim que monta.
  beforeEach(() => {
    server.use(http.get('https://rides.fateconnect.test/caronas', () => HttpResponse.json([])));
  });

  it.each([
    [RoutePathEnum.LANDING, 'Conectando a Comunidade Acadêmica'],
    [RoutePathEnum.SIGNUP, SIGNUP_TITLE],
    [RoutePathEnum.MENU, MENU_TITLE],
    [RoutePathEnum.LOST_AND_FOUND, LOST_AND_FOUND_TITLE],
    [RoutePathEnum.RIDES, RIDES_TITLE],
    // Dentro de `main`: o título da tela vive na área de conteúdo, não no cromo.
    // Buscar na página toda casaria com um título do rodapé de mesmo texto.
  ])('should resolve %s', (path, title) => {
    renderRoute(path);

    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: title }),
    ).toBeInTheDocument();
  });

  it('should redirect the root path to the landing page', () => {
    const router = renderRoute(RoutePathEnum.ROOT);

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  it('should send the dropped rides sub-routes to the landing page', () => {
    const router = renderRoute('/caronas/ofertar');

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  it('should send the dropped contact route to the landing page', () => {
    const router = renderRoute('/contato');

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  it('should send an unknown route to the landing page', () => {
    const router = renderRoute('/rota-que-nao-existe');

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });
});
