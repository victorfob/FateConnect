import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import * as C from './constants';
import { Unavailable, type UnavailableProps } from '.';

const DEFAULT_PROPS: UnavailableProps = { description: C.PROFILE_DESCRIPTION };

function renderComponent(props = DEFAULT_PROPS) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.PROFILE, element: <Unavailable {...props} /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.PROFILE] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Unavailable', () => {
  it('should announce that the area is not available yet', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.UNAVAILABLE_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.PROFILE_DESCRIPTION)).toBeInTheDocument();
  });

  it('should show the description of the route that rendered it', () => {
    renderComponent({ description: C.NOTIFICATIONS_DESCRIPTION });

    expect(screen.getByText(C.NOTIFICATIONS_DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText(C.PROFILE_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('should take the user back to the menu', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: C.BACK_TO_MENU_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.MENU);
  });
});
