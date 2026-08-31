import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';

import { render } from '../testing-library';

const MENU_STUB = <div>menu</div>;

/**
 * Monta a tela num roteador de memória e devolve o roteador, para o caso poder
 * afirmar sobre a URL. O menu entra porque toda tela da área logada tem a volta
 * para ele, e sem a rota o link quebraria o render.
 */
export function renderAtRoute(path: RoutePathEnum, element: ReactNode, search = '') {
  const router = createMemoryRouter(
    [
      { path, element },
      { path: RoutePathEnum.MENU, element: MENU_STUB },
    ],
    { initialEntries: [`${path}${search}`] },
  );
  render(<RouterProvider router={router} />);

  return router;
}
