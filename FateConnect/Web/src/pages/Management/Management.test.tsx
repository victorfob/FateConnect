import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import * as C from './constants';
import { Management } from '.';

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MANAGEMENT, element: <Management /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.MANAGEMENT] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Management', () => {
  it('should title the screen and offer the way back to the menu', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.MANAGEMENT_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should open on users, with the other tab resting', () => {
    renderComponent();

    expect(screen.getByRole('tab', { name: C.USERS_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByText(C.USERS_DESCRIPTION)).toBeInTheDocument();
  });

  it('should swap the message when the person picks the other tab', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL }));

    expect(screen.getByText(C.DENUNCIATIONS_DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText(C.USERS_DESCRIPTION)).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('should come back to users from the other tab', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.DENUNCIATIONS_TAB_LABEL }));
    await userEvent.click(screen.getByRole('tab', { name: C.USERS_TAB_LABEL }));

    expect(screen.getByText(C.USERS_DESCRIPTION)).toBeInTheDocument();
  });
});
