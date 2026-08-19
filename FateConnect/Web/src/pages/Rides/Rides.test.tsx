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

  it('should send the bare rides path to the search screen', () => {
    const router = renderRides(RoutePathEnum.RIDES);

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES_SEARCH);
  });
});
