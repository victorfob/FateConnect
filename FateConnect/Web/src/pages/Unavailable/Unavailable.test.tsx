import { createMemoryRouter, RouterProvider } from 'react-router';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import * as C from './constants';
import { Unavailable, type UnavailableProps } from '.';

const DEFAULT_PROPS: UnavailableProps = { description: C.NOTIFICATIONS_DESCRIPTION };
const OTHER_DESCRIPTION = 'A agenda de provas chega em uma próxima versão.';

function renderComponent(props = DEFAULT_PROPS) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.NOTIFICATIONS, element: <Unavailable {...props} /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.NOTIFICATIONS] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Unavailable', () => {
  it('should announce that the area is not available yet', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.UNAVAILABLE_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.NOTIFICATIONS_DESCRIPTION)).toBeInTheDocument();
  });

  it('should show the description of the route that rendered it', () => {
    renderComponent({ description: OTHER_DESCRIPTION });

    expect(screen.getByText(OTHER_DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText(C.NOTIFICATIONS_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('should take the user back to the menu', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.MENU);
  });
});
