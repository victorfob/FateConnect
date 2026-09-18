import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import * as C from './constants';
import { Management } from '.';

const EMPTY_PAGE = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

function renderAt(initialEntry: string = RoutePathEnum.MANAGEMENT) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MANAGEMENT, element: <Management /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Management', () => {
  beforeEach(() => {
    server.use(
      http.get('https://api.fateconnect.test/denunciations', () => HttpResponse.json(EMPTY_PAGE)),
    );
  });

  it('should title the screen and offer the way back to the menu', () => {
    renderAt();

    expect(screen.getByRole('heading', { name: C.MANAGEMENT_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should open on users when the address names no tab', () => {
    renderAt();

    expect(screen.getByRole('tab', { name: C.USERS_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(C.USERS_DESCRIPTION)).toBeInTheDocument();
  });

  // O endereço é o que devolve a mesma aba a quem salvou o link.
  it('should open the tab the address names', async () => {
    renderAt(`${RoutePathEnum.MANAGEMENT}?aba=denuncias`);

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.queryByText(C.USERS_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('should write the chosen tab into the address', async () => {
    const router = renderAt();

    await userEvent.click(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL }));

    await waitFor(() => expect(router.state.location.search).toContain('aba=denuncias'));
  });

  it('should come back to users from the other tab', async () => {
    renderAt(`${RoutePathEnum.MANAGEMENT}?aba=denuncias`);

    await userEvent.click(screen.getByRole('tab', { name: C.USERS_TAB_LABEL }));

    expect(await screen.findByText(C.USERS_DESCRIPTION)).toBeInTheDocument();
  });
});
