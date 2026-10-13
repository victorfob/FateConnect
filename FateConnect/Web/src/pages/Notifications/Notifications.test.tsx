import { createMemoryRouter, RouterProvider } from 'react-router';
import { FILTER_CLEAR_LABEL, FILTER_SUBMIT_LABEL, FILTER_TITLE_PLURAL } from '@design-system';
import { http, HttpResponse } from 'msw';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
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
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { pagedListHandler } from '@app/test/utils/pagedList';
import { declarationsFor, sheetRules } from '@app/test/utils/styleSheetRules';

import {
  FILTER_LABELS,
  NOTIFICATION_STATUS_FILTER_OPTIONS,
  NOTIFICATION_TYPE_FILTER_OPTIONS,
  NotificationStatusFilterEnum,
} from './components/NotificationFilter/constants';
import * as C from './constants';
import { Notifications } from '.';

const IN_APP_NOTIFICATIONS_URL = 'https://api.fateconnect.test/inappnotifications';
const UNREAD_COUNT_URL = `${IN_APP_NOTIFICATIONS_URL}/unread-count`;
const RIDES_URL = 'https://api.fateconnect.test/rides';
const NO_CONTENT = 204;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const RETRY_WINDOW_MS = 5000;

const DENUNCIATION_NOTICE: InAppNotification = {
  id: 1,
  type: InAppNotificationTypeEnum.DENUNCIATION_RECEIVED,
  content:
    'Recebemos sua denúncia de direção imprudente na carona. O andamento aparece na página Denúncias, na aba Acompanhar.',
  referenceId: 'a1f0d2c4-5b3e-4a6c-9f81-7d2e5b0a3c14',
  isRead: false,
  createdAt: '2026-10-12T17:00:00Z',
};

const RIDE_NOTICE: InAppNotification = {
  id: 2,
  type: InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD,
  content: 'Uma nova carona para Fatec Sorocaba foi ofertada. Confira se ela serve para você.',
  referenceId: 'c7d2e9a1-4b6f-4c3d-8e2a-5f1b9d0c7a64',
  isRead: false,
  createdAt: '2026-10-12T16:00:00Z',
};

const ITEM_NOTICE: InAppNotification = {
  id: 3,
  type: InAppNotificationTypeEnum.ITEM_ARCHIVED,
  content:
    'O item “Garrafa azul” foi arquivado automaticamente por inatividade, depois de 60 dias sem alteração.',
  referenceId: 'e1c4a7b2-3f60-4d8e-9a15-2b7c0d9e4f31',
  isRead: true,
  createdAt: '2026-10-10T09:00:00Z',
};

function listing(all: InAppNotification[], unreadCount: number, onRequest?: (url: URL) => void) {
  server.use(
    pagedListHandler(IN_APP_NOTIFICATIONS_URL, all, onRequest),
    http.get(UNREAD_COUNT_URL, () => HttpResponse.json(unreadCount)),
  );
}

function renderScreen(search = '') {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.NOTIFICATIONS, element: <Notifications /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
      { path: RoutePathEnum.DENUNCIATIONS, element: <div>denúncias</div> },
      { path: RoutePathEnum.RIDES, element: <div>caronas</div> },
      { path: RoutePathEnum.LOST_AND_FOUND, element: <div>achados e perdidos</div> },
    ],
    { initialEntries: [`${RoutePathEnum.NOTIFICATIONS}${search}`] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

const optionLabel = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)!.label;

function addressOf(router: ReturnType<typeof renderScreen>) {
  const { pathname, search } = router.state.location;

  return { pathname, params: Object.fromEntries(new URLSearchParams(search)) };
}

describe('Notifications', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    listing([], 0);
  });

  it('should name the screen and offer the way back, with no tabs', async () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: C.NOTIFICATIONS_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: BACK_TO_MENU_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should show the whole notice text, which the panel cuts', async () => {
    listing([DENUNCIATION_NOTICE], 1);
    renderScreen();

    const content = await screen.findByText(DENUNCIATION_NOTICE.content);

    expect(declarationsFor(sheetRules(), content)).toContain('display:block');
    expect(declarationsFor(sheetRules(), content)).not.toContain('line-clamp');
  });

  it('should list the notifications with the title of each type', async () => {
    listing([DENUNCIATION_NOTICE, RIDE_NOTICE, ITEM_NOTICE], 2);
    renderScreen();

    expect(await screen.findByText(DENUNCIATION_NOTICE.content)).toBeInTheDocument();
    Object.values(IN_APP_NOTIFICATION_TITLES).forEach((title) =>
      expect(screen.getByText(title)).toBeInTheDocument(),
    );
    expect(
      screen.getAllByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    ).toHaveLength(2);
  });

  it('should say the list failed instead of calling it empty', async () => {
    server.use(
      http.get(IN_APP_NOTIFICATIONS_URL, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    renderScreen();

    expect(
      await screen.findAllByText(
        IN_APP_NOTIFICATION_TEXTS.loadFailed,
        {},
        { timeout: RETRY_WINDOW_MS },
      ),
    ).not.toHaveLength(0);
    expect(screen.queryByText(C.EMPTY_LIST_MESSAGE)).not.toBeInTheDocument();
  });

  it('should read the filter from the address and ask the api for it', async () => {
    const asked: URL[] = [];
    listing([RIDE_NOTICE], 1, (url) => asked.push(url));
    renderScreen('?situacao=nao-lidas&tipo=caronas');

    await screen.findByText(RIDE_NOTICE.content);

    expect(asked.map((url) => Object.fromEntries(url.searchParams))).toEqual([
      { page: '1', pageSize: '10', isRead: 'false', type: 'RideToNeighborhood' },
    ]);
  });

  it('should write the chosen filter to the address in Portuguese', async () => {
    const router = renderScreen();

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(
      screen.getByRole('option', {
        name: optionLabel(NOTIFICATION_STATUS_FILTER_OPTIONS, NotificationStatusFilterEnum.UNREAD),
      }),
    );
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.type }));
    await userEvent.click(
      screen.getByRole('option', {
        name: optionLabel(
          NOTIFICATION_TYPE_FILTER_OPTIONS,
          InAppNotificationTypeEnum.ITEM_ARCHIVED,
        ),
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() =>
      expect(addressOf(router).params).toEqual({
        situacao: 'nao-lidas',
        tipo: 'achados-perdidos',
      }),
    );
  });

  it('should clear the filter the address carried', async () => {
    const router = renderScreen('?situacao=nao-lidas&tipo=caronas');

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.click(screen.getByRole('button', { name: FILTER_CLEAR_LABEL }));

    await waitFor(() => expect(addressOf(router).params).toEqual({}));
  });

  it('should say the notice failed to open and stay when the ride cannot be read', async () => {
    listing([RIDE_NOTICE], 1);
    server.use(
      http.patch(
        `${IN_APP_NOTIFICATIONS_URL}/:id/read`,
        () => new HttpResponse(null, { status: NO_CONTENT }),
      ),
      http.get(`${RIDES_URL}/:id`, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    const router = renderScreen();

    await userEvent.click(await screen.findByText(RIDE_NOTICE.content));

    expect(await screen.findByText(IN_APP_NOTIFICATION_TEXTS.openFailed)).toBeInTheDocument();
    expect(addressOf(router).pathname).toBe(RoutePathEnum.NOTIFICATIONS);
  });

  it('should take the denunciation notice to the denunciations, marking it as read', async () => {
    let markedId: string | undefined;
    listing([DENUNCIATION_NOTICE], 1);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, ({ params }) => {
        markedId = String(params.id);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    const router = renderScreen();

    await userEvent.click(await screen.findByText(DENUNCIATION_NOTICE.content));

    await waitFor(() => expect(addressOf(router).pathname).toBe(RoutePathEnum.DENUNCIATIONS));
    expect(markedId).toBe(String(DENUNCIATION_NOTICE.id));
  });

  it('should take the archived item notice to the archived items, without marking it again', async () => {
    let markRequests = 0;
    listing([ITEM_NOTICE], 0);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, () => {
        markRequests += 1;
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    const router = renderScreen();

    await userEvent.click(await screen.findByText(ITEM_NOTICE.content));

    await waitFor(() =>
      expect(addressOf(router)).toEqual({
        pathname: RoutePathEnum.LOST_AND_FOUND,
        params: { meus: 'sim', situacao: 'arquivado' },
      }),
    );
    expect(markRequests).toBe(0);
  });

  it('should take the ride notice to the rides searched by its destination', async () => {
    let askedRide: string | undefined;
    listing([RIDE_NOTICE], 1);
    server.use(
      http.patch(
        `${IN_APP_NOTIFICATIONS_URL}/:id/read`,
        () => new HttpResponse(null, { status: NO_CONTENT }),
      ),
      http.get(`${RIDES_URL}/:id`, ({ params }) => {
        askedRide = String(params.id);
        return HttpResponse.json({ id: params.id, destination: 'Fatec Sorocaba' });
      }),
    );
    const router = renderScreen();

    await userEvent.click(await screen.findByText(RIDE_NOTICE.content));

    await waitFor(() =>
      expect(addressOf(router)).toEqual({
        pathname: RoutePathEnum.RIDES,
        params: { busca: 'Fatec Sorocaba' },
      }),
    );
    expect(askedRide).toBe(RIDE_NOTICE.referenceId);
  });

  it('should warn and stay when the ride was removed, still marking the notice as read', async () => {
    let markedId: string | undefined;
    listing([RIDE_NOTICE], 1);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, ({ params }) => {
        markedId = String(params.id);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
      http.get(`${RIDES_URL}/:id`, () => new HttpResponse(null, { status: NOT_FOUND })),
    );
    const router = renderScreen();

    await userEvent.click(await screen.findByText(RIDE_NOTICE.content));

    expect(await screen.findByText(IN_APP_NOTIFICATION_TEXTS.rideRemoved)).toBeInTheDocument();
    expect(addressOf(router).pathname).toBe(RoutePathEnum.NOTIFICATIONS);
    expect(markedId).toBe(String(RIDE_NOTICE.id));
  });

  it('should mark one as read from the check, staying on the screen', async () => {
    let markedId: string | undefined;
    listing([RIDE_NOTICE], 1);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, ({ params }) => {
        markedId = String(params.id);
        listing([{ ...RIDE_NOTICE, isRead: true }], 0);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    const router = renderScreen();

    await userEvent.click(
      await screen.findByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
      ).not.toBeInTheDocument(),
    );
    expect(markedId).toBe(String(RIDE_NOTICE.id));
    expect(addressOf(router).pathname).toBe(RoutePathEnum.NOTIFICATIONS);
  });

  it('should offer marking all as read only while something is unread', async () => {
    let markedAll = false;
    listing([DENUNCIATION_NOTICE, RIDE_NOTICE], 2);
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/read-all`, () => {
        markedAll = true;
        listing(
          [
            { ...DENUNCIATION_NOTICE, isRead: true },
            { ...RIDE_NOTICE, isRead: true },
          ],
          0,
        );
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderScreen();

    await userEvent.click(
      await screen.findByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAllAsRead }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAllAsRead }),
      ).not.toBeInTheDocument(),
    );
    expect(markedAll).toBe(true);
    expect(
      screen.queryByRole('button', { name: IN_APP_NOTIFICATION_TEXTS.markAsRead }),
    ).not.toBeInTheDocument();
  });
});
