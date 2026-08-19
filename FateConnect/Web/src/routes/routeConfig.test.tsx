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
    [RoutePath.LANDING, 'Início'],
    [RoutePath.SIGNUP, 'Cadastro'],
    [RoutePath.MENU, 'Menu'],
    [RoutePath.LOST_AND_FOUND, 'Achados e Perdidos'],
    [RoutePath.CONTACT, 'Contato'],
    [RoutePath.RIDES_SEARCH, 'Buscar carona'],
    [RoutePath.RIDES_OFFER, 'Ofertar carona'],
  ])('resolve %s', (path, titulo) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
  });

  it('redireciona a raiz para a landing', () => {
    const router = renderRoute(RoutePath.ROOT);

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
  });

  it('redireciona /caronas para a busca', () => {
    const router = renderRoute(RoutePath.RIDES);

    expect(router.state.location.pathname).toBe(RoutePath.RIDES_SEARCH);
  });

  it('manda rota desconhecida para a landing', () => {
    const router = renderRoute('/rota-que-nao-existe');

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
  });
});
