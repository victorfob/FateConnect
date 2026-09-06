import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import * as C from './constants';
import { NotificationsMenu } from '.';

function renderMenu() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MENU, element: <NotificationsMenu /> },
      { path: RoutePathEnum.NOTIFICATIONS, element: <div>notificações</div> },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

async function openPanel() {
  await userEvent.click(screen.getByRole('button', { name: C.TRIGGER_LABEL }));
}

function backdropElement(): HTMLElement {
  const backdrop = document.querySelector('.MuiBackdrop-root');
  if (!(backdrop instanceof HTMLElement)) throw new Error('Popover backdrop not rendered');

  return backdrop;
}

describe('NotificationsMenu', () => {
  it('should keep the panel closed until the bell is used', () => {
    renderMenu();

    expect(screen.getByRole('button', { name: C.TRIGGER_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open a panel named after the title, with the empty state', async () => {
    renderMenu();

    await openPanel();

    expect(screen.getByRole('dialog', { name: C.PANEL_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.EMPTY_STATUS)).toBeInTheDocument();
    expect(screen.getByText(C.EMPTY_DESCRIPTION)).toBeInTheDocument();
  });

  it('should navigate to the notifications screen and close the panel', async () => {
    const router = renderMenu();
    await openPanel();

    await userEvent.click(screen.getByRole('link', { name: C.ALL_NOTIFICATIONS_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.NOTIFICATIONS);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should close on Escape and give the focus back to the trigger', async () => {
    renderMenu();
    await openPanel();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: C.TRIGGER_LABEL })).toHaveFocus();
  });

  it('should close when the click lands outside the panel', async () => {
    renderMenu();
    await openPanel();

    await userEvent.click(backdropElement());

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
