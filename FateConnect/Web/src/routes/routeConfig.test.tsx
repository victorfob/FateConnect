import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@app/test/testing-library';
import { RoutePath } from './paths';
import { routeConfig } from './routeConfig';

function renderRoute(initialPath: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('routeConfig', () => {
  it.each([
    [RoutePath.LANDING, 'Conectando a Comunidade Acadêmica'],
    [RoutePath.SIGNUP, 'Cadastro'],
    [RoutePath.MENU, 'Menu'],
    [RoutePath.LOST_AND_FOUND, 'Achados e Perdidos'],
    [RoutePath.CONTACT, 'Contato'],
    [RoutePath.RIDES_SEARCH, 'Buscar carona'],
    [RoutePath.RIDES_OFFER, 'Ofertar carona'],
  ])('should resolve %s', (path, title) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('should redirect the root path to the landing page', () => {
    const router = renderRoute(RoutePath.ROOT);

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
  });

  it('should redirect /caronas to the search screen', () => {
    const router = renderRoute(RoutePath.RIDES);

    expect(router.state.location.pathname).toBe(RoutePath.RIDES_SEARCH);
  });

  it('should send an unknown route to the landing page', () => {
    const router = renderRoute('/rota-que-nao-existe');

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
  });
});
