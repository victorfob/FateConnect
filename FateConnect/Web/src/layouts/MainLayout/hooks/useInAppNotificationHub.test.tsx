import { http, HttpResponse } from 'msw';

import { useUnreadInAppNotificationCount } from '@app/hooks/useUnreadInAppNotificationCount';
import { server } from '@app/mocks/server';
import { AppProviders } from '@app/providers/AppProviders';
import { subscribeToSessionExpiry } from '@app/services/auth/sessionExpiry';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import {
  createInAppNotificationHub,
  InAppNotificationHubEventEnum,
} from '@app/services/inAppNotifications/inAppNotificationHub';
import { act, renderHook, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { useInAppNotificationHub } from './useInAppNotificationHub';

vi.mock('@app/services/inAppNotifications/inAppNotificationHub', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createInAppNotificationHub: vi.fn(),
}));

const UNREAD_COUNT_URL = 'https://api.fateconnect.test/inappnotifications/unread-count';

const mockCreateHub = createInAppNotificationHub as Mock;

type Handler = (...args: unknown[]) => unknown;

function fakeConnection() {
  const handlers = new Map<string, Handler>();

  return {
    handlers,
    connection: {
      on: vi.fn((event: string, handler: Handler) => handlers.set(event, handler)),
      onreconnected: vi.fn((handler: Handler) => handlers.set('reconnected', handler)),
      onclose: vi.fn((handler: Handler) => handlers.set('close', handler)),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function countingFrom(first: number) {
  let current = first;
  server.use(http.get(UNREAD_COUNT_URL, () => HttpResponse.json(current)));

  return (next: number) => {
    current = next;
  };
}

function renderHub() {
  return renderHook(
    () => {
      useInAppNotificationHub();

      return useUnreadInAppNotificationCount();
    },
    { wrapper: AppProviders },
  );
}

describe('useInAppNotificationHub', () => {
  let hub: ReturnType<typeof fakeConnection>;

  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    hub = fakeConnection();
    mockCreateHub.mockReturnValue(hub.connection);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should open the connection once the logged area is up', async () => {
    renderHub();

    await waitFor(() => expect(hub.connection.start).toHaveBeenCalledTimes(1));
  });

  it('should read the count again when a notification arrives', async () => {
    const setCount = countingFrom(0);
    const { result } = renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalled());

    setCount(1);
    act(() => {
      hub.handlers.get(InAppNotificationHubEventEnum.RECEIVE_NOTIFICATION)?.();
    });

    await waitFor(() => expect(result.current).toBe(1));
  });

  it('should read the count again after coming back from a drop', async () => {
    const setCount = countingFrom(0);
    const { result } = renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalled());

    setCount(3);
    act(() => {
      hub.handlers.get('reconnected')?.();
    });

    await waitFor(() => expect(result.current).toBe(3));
  });

  it('should open again and read the count once the automatic reconnection gives up', async () => {
    const setCount = countingFrom(0);
    const { result } = renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalledTimes(1));

    setCount(2);
    await act(async () => {
      await hub.handlers.get('close')?.();
    });

    expect(hub.connection.start).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current).toBe(2));
  });

  it('should end the session in this tab when the api revokes it', async () => {
    const expired = vi.fn();
    const unsubscribe = subscribeToSessionExpiry(expired);
    renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalled());

    act(() => {
      hub.handlers.get(InAppNotificationHubEventEnum.SESSION_REVOKED)?.();
    });

    expect(expired).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getToken()).toBeNull();
    unsubscribe();
  });

  it('should not call the session expired in the tab that signed out', async () => {
    const expired = vi.fn();
    const unsubscribe = subscribeToSessionExpiry(expired);
    renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalled());

    act(() => {
      tokenStorage.clear();
      hub.handlers.get(InAppNotificationHubEventEnum.SESSION_REVOKED)?.();
    });

    expect(expired).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('should close the connection and not reopen it when the logged area goes away', async () => {
    const { unmount } = renderHub();
    await waitFor(() => expect(hub.connection.start).toHaveBeenCalledTimes(1));

    unmount();
    await act(async () => {
      await hub.handlers.get('close')?.();
    });

    expect(hub.connection.stop).toHaveBeenCalledTimes(1);
    expect(hub.connection.start).toHaveBeenCalledTimes(1);
  });
});
