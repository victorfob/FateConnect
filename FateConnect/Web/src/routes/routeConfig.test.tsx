import { http, HttpResponse } from 'msw';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';

import { render, screen } from '@app/test/testing-library';
import { RIDES_TITLE } from '@app/pages/Rides/constants';
import { SIGNUP_TITLE } from '@app/pages/Signup/constants';
import { RoutePathEnum } from './paths';
import { routeConfig } from './routeConfig';

function renderRoute(initialPath: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('routeConfig', () => {
  // A tela de busca lista caronas assim que monta.
  beforeEach(() => {
    server.use(http.get('https://rides.fateconnect.test/caronas', () => HttpResponse.json([])));
  });

  it.each([
    [RoutePathEnum.LANDING, 'Conectando a Comunidade Acadêmica'],
    [RoutePathEnum.SIGNUP, SIGNUP_TITLE],
    [RoutePathEnum.MENU, 'Menu'],
    [RoutePathEnum.LOST_AND_FOUND, 'Achados e Perdidos'],
    [RoutePathEnum.CONTACT, 'Contato'],
    [RoutePathEnum.RIDES_SEARCH, RIDES_TITLE],
    [RoutePathEnum.RIDES_OFFER, RIDES_TITLE],
  ])('should resolve %s', (path, title) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('should redirect the root path to the landing page', () => {
    const router = renderRoute(RoutePathEnum.ROOT);

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  it('should redirect /caronas to the search screen', () => {
    const router = renderRoute(RoutePathEnum.RIDES);

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES_SEARCH);
  });

  it('should send an unknown route to the landing page', () => {
    const router = renderRoute('/rota-que-nao-existe');

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });
});
