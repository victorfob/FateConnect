import type { HubConnection } from '@microsoft/signalr';

import { keepConnected } from './inAppNotificationHub';

const RETRY_DELAY_MS = 5000;

function connectionStartingWith(start: Mock): HubConnection {
  return { start } as unknown as HubConnection;
}

describe('keepConnected', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should try again after a while when the connection fails to open', async () => {
    const start = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const connected = keepConnected(connectionStartingWith(start), new AbortController().signal);

    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS - 1);
    expect(start).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await connected;
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('should stop trying once whoever opened it gives up', async () => {
    const start = vi.fn().mockRejectedValue(new Error('offline'));
    const unmounted = new AbortController();
    const connected = keepConnected(connectionStartingWith(start), unmounted.signal);
    await vi.advanceTimersByTimeAsync(0);

    unmounted.abort();
    await connected;
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS * 2);

    expect(start).toHaveBeenCalledTimes(1);
  });
});
