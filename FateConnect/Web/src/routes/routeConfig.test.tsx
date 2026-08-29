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
  // Caronas e achados e perdidos listam assim que montam.
  beforeEach(() => {
    server.use(
      http.get('https://api.fateconnect.test/Rides', () => HttpResponse.json([])),
      http.get('https://api.fateconnect.test/achado', () => HttpResponse.json([])),
    );
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
