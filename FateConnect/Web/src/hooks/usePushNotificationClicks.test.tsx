import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { act, render, screen, waitFor } from '@app/test/testing-library';
import { installPushBrowser, removePushBrowser } from '@app/test/utils/pushBrowser';

import { usePushNotificationClicks } from './usePushNotificationClicks';

function ClickListener() {
  usePushNotificationClicks();

  return <Outlet />;
}

function renderListening() {
  const router = createMemoryRouter(
    [
      {
        element: <ClickListener />,
        children: [
          { path: RoutePathEnum.MENU, element: <div>menu</div> },
          { path: RoutePathEnum.OPEN_NOTIFICATION, element: <div>abrindo</div> },
        ],
      },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

function postFromWorker(data: unknown) {
  act(() => {
    navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data }));
  });
}

describe('usePushNotificationClicks', () => {
  afterEach(() => {
    removePushBrowser();
  });

  it('should open the notification the worker hands to this window', async () => {
    installPushBrowser({ permission: 'granted' });
    const router = renderListening();
    const url = `${RoutePathEnum.OPEN_NOTIFICATION}?aviso=7&tipo=denuncias`;

    postFromWorker({ kind: 'open-notification', url });

    expect(await screen.findByText('abrindo')).toBeInTheDocument();
    expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(url);
  });

  it('should ignore a message that leads anywhere else', async () => {
    installPushBrowser({ permission: 'granted' });
    const router = renderListening();

    postFromWorker({ kind: 'open-notification', url: RoutePathEnum.MANAGEMENT });
    postFromWorker({ kind: 'outra-coisa', url: `${RoutePathEnum.OPEN_NOTIFICATION}?aviso=7` });
    postFromWorker('open-notification');

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(screen.getByText('menu')).toBeInTheDocument();
  });

  it('should stay quiet where the browser has no service worker', () => {
    renderListening();

    expect(screen.getByText('menu')).toBeInTheDocument();
  });
});
