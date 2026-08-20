import { http, HttpResponse } from 'msw';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';
import { routeConfig } from '@app/routes/routeConfig';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';
import * as C from './constants';
import { OFFER_TITLE } from './screens/OfferRide/constants';

const RIDES_URL = 'https://rides.fateconnect.test/caronas';

/** Cobre a tentativa inicial, os 2s de espera e a repetição. */
const RETRY_WINDOW_MS = 5000;

function renderRides(initialPath: string = RoutePathEnum.RIDES_SEARCH) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('Rides', () => {
  beforeEach(() => {
    server.use(http.get(RIDES_URL, () => HttpResponse.json([])));
  });

  it('should render the title and the way back to the menu', () => {
    renderRides();

    expect(screen.getByRole('heading', { name: C.RIDES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should mark the current tab for assistive technology', () => {
    renderRides();

    expect(screen.getByRole('link', { name: C.SEARCH_TAB_LABEL })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: C.OFFER_TAB_LABEL })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should move to the offer screen through the tab', async () => {
    const router = renderRides();

    await userEvent.click(screen.getByRole('link', { name: C.OFFER_TAB_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES_OFFER);
    expect(await screen.findByRole('heading', { name: OFFER_TITLE })).toBeInTheDocument();
  });

  // Sem endereço de API a requisição cai no servidor de desenvolvimento, que
  // responde o HTML da aplicação com status 200. Antes de validar o formato, a
  // tela recebia texto no lugar da lista e quebrava no `map`.
  it('should notify instead of breaking when the api does not return a list', async () => {
    server.use(http.get(RIDES_URL, () => HttpResponse.text('<!doctype html><html></html>')));

    renderRides();

    // A consulta tenta de novo antes de desistir, com 2s de espera entre as
    // tentativas — mais que o limite padrão do `findBy`.
    const notice = await screen.findByText(C.RIDE_LIST_MESSAGES.loadFailed, undefined, {
      timeout: RETRY_WINDOW_MS,
    });

    expect(notice).toBeInTheDocument();
    expect(screen.getByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should send the bare rides path to the search screen', () => {
    const router = renderRides(RoutePathEnum.RIDES);

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES_SEARCH);
  });
});
