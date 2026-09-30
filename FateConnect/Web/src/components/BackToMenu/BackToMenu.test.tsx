import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import { BACK_TO_MENU_LABEL } from './constants';
import { BackToMenu } from '.';

const MENU_CONTENT = 'menu';

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.PREFERENCES, element: <BackToMenu /> },
      { path: RoutePathEnum.MENU, element: <div>{MENU_CONTENT}</div> },
    ],
    { initialEntries: [RoutePathEnum.PREFERENCES] },
  );
  render(<RouterProvider router={router} />);
}

describe('BackToMenu', () => {
  it('should take the person back to the menu', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));

    expect(screen.getByText(MENU_CONTENT)).toBeInTheDocument();
  });
});
