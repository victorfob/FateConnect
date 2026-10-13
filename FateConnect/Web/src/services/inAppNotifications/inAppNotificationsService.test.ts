import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import {
  getUnreadInAppNotificationCount,
  listInAppNotifications,
  markAllInAppNotificationsAsRead,
  markInAppNotificationAsRead,
} from './inAppNotificationsService';
import { InAppNotificationTypeEnum } from './types';

const IN_APP_NOTIFICATIONS_URL = 'https://api.fateconnect.test/inappnotifications';
const NO_CONTENT = 204;
const UNREAD_COUNT = 3;

const EMPTY_PAGE = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

describe('inAppNotificationsService', () => {
  it('should translate the filters into the api query parameters', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(IN_APP_NOTIFICATIONS_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json(EMPTY_PAGE);
      }),
    );

    await listInAppNotifications({
      page: 2,
      pageSize: 10,
      isRead: false,
      type: InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD,
    });

    expect(Object.fromEntries(received!)).toEqual({
      page: '2',
      pageSize: '10',
      isRead: 'false',
      type: 'RideToNeighborhood',
    });
  });

  it('should fail when the list response is not a page', async () => {
    server.use(
      http.get(IN_APP_NOTIFICATIONS_URL, () => HttpResponse.text('<!doctype html><html></html>')),
    );

    await expect(listInAppNotifications()).rejects.toThrow(/não é uma página/);
  });

  it('should read the unread count', async () => {
    server.use(
      http.get(`${IN_APP_NOTIFICATIONS_URL}/unread-count`, () => HttpResponse.json(UNREAD_COUNT)),
    );

    await expect(getUnreadInAppNotificationCount()).resolves.toBe(UNREAD_COUNT);
  });

  it('should fail when the count response is not a number', async () => {
    server.use(
      http.get(`${IN_APP_NOTIFICATIONS_URL}/unread-count`, () =>
        HttpResponse.text('<!doctype html><html></html>'),
      ),
    );

    await expect(getUnreadInAppNotificationCount()).rejects.toThrow(/não é um número/);
  });

  it('should mark one notification as read by id', async () => {
    let markedId: string | undefined;
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/:id/read`, ({ params }) => {
        markedId = String(params.id);
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await markInAppNotificationAsRead(42);

    expect(markedId).toBe('42');
  });

  it('should mark every notification as read', async () => {
    let called = false;
    server.use(
      http.patch(`${IN_APP_NOTIFICATIONS_URL}/read-all`, () => {
        called = true;
        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await markAllInAppNotificationsAsRead();

    expect(called).toBe(true);
  });
});
