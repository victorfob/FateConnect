import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import { LostAndFound } from '.';
import * as C from './constants';

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.LOST_AND_FOUND, element: <LostAndFound /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.LOST_AND_FOUND] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('LostAndFound', () => {
  it('should render the title as the page heading and the notice below it', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.LOST_AND_FOUND_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.LOST_AND_FOUND_DESCRIPTION)).toBeInTheDocument();
  });

  it('should take the user back to the menu from the action', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: C.BACK_TO_MENU_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.MENU);
  });
});
