import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATION_TITLES,
} from '@app/constants/inAppNotifications';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import {
  InAppNotificationTypeEnum,
  type InAppNotification,
} from '@app/services/inAppNotifications/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { pagedListHandler } from '@app/test/utils/pagedList';
import {
  declarationsFor,
  narrowDeclarationsFor,
  sheetRules,
} from '@app/test/utils/styleSheetRules';

import { EMPTY_DESCRIPTION, EMPTY_STATUS } from './components/LatestNotifications/constants';
import * as C from './constants';
import { NotificationsMenu } from '.';

const IN_APP_NOTIFICATIONS_URL = 'https://api.fateconnect.test/inappnotifications';
const UNREAD_COUNT_URL = `${IN_APP_NOTIFICATIONS_URL}/unread-count`;
const NO_CONTENT = 204;
const SERVER_ERROR = 500;

/** O cliente repete a requisição antes de desistir, e o erro só aparece no fim. */
const RETRY_WINDOW_MS = 5000;

const UNREAD: InAppNotification = {
  id: 1,
  type: InAppNotificationTypeEnum.REPORT_RECEIVED,
  content:
    'Recebemos sua denúncia de direção imprudente na carona. O andamento aparece na página Denúncias, na aba Acompanhar.',
  referenceId: 'a1f0d2c4-5b3e-4a6c-9f81-7d2e5b0a3c14',
  isRead: false,
  createdAt: '2026-10-12T17:00:00Z',
};

function notificationsOf(count: number): InAppNotification[] {
  return Array.from({ length: count }, (_, index) => ({ ...UNREAD, id: index + 1 }));
}

function respondWith(all: InAppNotification[], unreadCount: number) {
  server.use(
    pagedListHandler(IN_APP_NOTIFICATIONS_URL, all),
    http.get(UNREAD_COUNT_URL, () => HttpResponse.json(unreadCount)),
  );
}

function renderMenu() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MENU, element: <NotificationsMenu /> },
      { path: RoutePathEnum.NOTIFICATIONS, element: <div>notificações</div> },
      { path: RoutePathEnum.REPORTS, element: <div>denúncias</div> },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

async function openPanel(label = C.TRIGGER_LABEL) {
  await userEvent.click(await screen.findByRole('button', { name: label }));

  return screen.getByRole('dialog', { name: C.PANEL_TITLE });
}

function backdropElement(): HTMLElement {
  const backdrop = document.querySelector('.MuiBackdrop-root');
  if (!(backdrop instanceof HTMLElement)) throw new Error('Popover backdrop not rendered');

  return backdrop;
}

describe('NotificationsMenu', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    respondWith([], 0);
  });

  it('should keep the panel closed until the bell is used', () => {
    renderMenu();

    expect(screen.getByRole('button', { name: C.TRIGGER_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the unread count on the bell and say it in the button name', async () => {
    respondWith([UNREAD], 2);
    renderMenu();

    expect(await screen.findByRole('button', { name: C.triggerLabel(2) })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should name the count in the singular and in the plural', () => {
    expect(C.triggerLabel(0)).toBe('Abrir notificações');
    expect(C.triggerLabel(1)).toBe('Abrir notificações (1 nova)');
    expect(C.triggerLabel(12)).toBe('Abrir notificações (12 novas)');
  });

  it('should open a panel named after the title, with the empty state', async () => {
    renderMenu();

    const panel = await openPanel();

    expect(await within(panel).findByText(EMPTY_STATUS)).toBeInTheDocument();
    expect(within(panel).getByText(EMPTY_DESCRIPTION)).toBeInTheDocument();
    expect(
      within(panel).queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAllAsRead }),
    ).not.toBeInTheDocument();
  });

  it('should cut the notice text at two lines in the panel', async () => {
    respondWith([UNREAD], 1);
    renderMenu();

    const panel = await openPanel(C.triggerLabel(1));

    expect(declarationsFor(sheetRules(), await within(panel).findByText(UNREAD.content))).toContain(
      '-webkit-line-clamp:2',
    );
  });

  it('should start the mark all text in line with the title when it wraps on the phone', async () => {
    respondWith([UNREAD], 1);
    renderMenu();
    const panel = await openPanel(C.triggerLabel(1));

    const markAll = within(panel).getByRole('button', {
      name: IN_APP_NOTIFICATION_TEXTS.markAllAsRead,
    });

    expect(narrowDeclarationsFor(markAll)).toContain('padding-left:0rem');
    expect(declarationsFor(sheetRules(), markAll)).not.toContain('padding-left:0rem');
  });

  it('should list only the three latest unread notifications', async () => {
    const asked: URL[] = [];
    server.use(
      pagedListHandler(IN_APP_NOTIFICATIONS_URL, notificationsOf(7), (url) => asked.push(url)),
    );
    renderMenu();

    const panel = await openPanel();

    expect(
      await within(panel).findAllByText(
        IN_APP_NOTIFICATION_TITLES[InAppNotificationTypeEnum.REPORT_RECEIVED],
      ),
    ).toHaveLength(C.LATEST_UNREAD_COUNT);
    expect(asked.map((url) => Object.fromEntries(url.searchParams))).toEqual([
      { page: '1', pageSize: '3', isRead: 'false' },
    ]);
  });

  it('should say inside the panel when the list fails to load', async () => {
    server.use(
      http.get(IN_APP_NOTIFICATIONS_URL, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    renderMenu();

    const panel = await openPanel();

    expect(
      await within(panel).findByRole('alert', {}, { timeout: RETRY_WINDOW_MS }),
    ).toHaveTextContent(IN_APP_NOTIFICATION_TEXTS.loadFailed);
  });

  it('should mark every notification as read from the top of the panel', async () => {
    let markedAll = false;
    respondWith([UNREAD], 1);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/read-all`, () => {
        markedAll = true;
        respondWith([{ ...UNREAD, isRead: true }], 0);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderMenu();
    const panel = await openPanel(C.triggerLabel(1));

    await userEvent.click(
      within(panel).getByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAllAsRead }),
    );

    await waitFor(() => expect(markedAll).toBe(true));
    // O painel aberto esconde o resto da página da árvore de acessibilidade.
    expect(
      await screen.findByRole('button', { name: C.TRIGGER_LABEL, hidden: true }),
    ).toBeInTheDocument();
    expect(
      within(panel).queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    ).not.toBeInTheDocument();
  });

  it('should mark the notification as read, take to its destination and close the panel', async () => {
    let markedId: string | undefined;
    respondWith([UNREAD], 1);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, ({ params }) => {
        markedId = String(params.id);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    const router = renderMenu();
    const panel = await openPanel(C.triggerLabel(1));

    await userEvent.click(await within(panel).findByText(UNREAD.content));

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.REPORTS));
    expect(markedId).toBe(String(UNREAD.id));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
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
