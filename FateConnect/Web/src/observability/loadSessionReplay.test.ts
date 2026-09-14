import { getClient, replayIntegration } from '@sentry/react';

import { scheduleSessionReplay } from './loadSessionReplay';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  getClient: vi.fn(),
  replayIntegration: vi.fn(),
}));

const SESSION_REPLAY = { name: 'Replay' };

const mockGetClient = getClient as Mock;
const mockReplayIntegration = replayIntegration as Mock;

function stubReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { value: state, configurable: true });
}

describe('scheduleSessionReplay', () => {
  let addIntegration: Mock;

  beforeEach(() => {
    addIntegration = vi.fn();
    mockGetClient.mockReturnValue({ addIntegration });
    mockReplayIntegration.mockReturnValue(SESSION_REPLAY);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.doUnmock('./sessionReplay');
    vi.resetModules();
    stubReadyState('complete');
  });

  it('should register the replay once the document has finished loading', async () => {
    stubReadyState('complete');

    scheduleSessionReplay();

    await vi.waitFor(() => expect(addIntegration).toHaveBeenCalledWith(SESSION_REPLAY));
  });

  it('should wait for the load event while the document is still loading', async () => {
    stubReadyState('loading');

    scheduleSessionReplay();

    expect(addIntegration).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));

    await vi.waitFor(() => expect(addIntegration).toHaveBeenCalledWith(SESSION_REPLAY));
  });

  // O que a política de privacidade declara: texto mascarado e mídia bloqueada.
  it('should mask every text and block every media', async () => {
    stubReadyState('complete');

    scheduleSessionReplay();

    await vi.waitFor(() =>
      expect(mockReplayIntegration).toHaveBeenCalledWith({
        maskAllText: true,
        blockAllMedia: true,
      }),
    );
  });

  it('should stay inert without a client, so a build without dsn reports nothing', async () => {
    stubReadyState('complete');
    mockGetClient.mockReturnValue(undefined);

    scheduleSessionReplay();

    await vi.waitFor(() => expect(mockGetClient).toHaveBeenCalled());
    expect(mockReplayIntegration).not.toHaveBeenCalled();
  });

  it('should report a chunk that fails to load as a handled warning', async () => {
    stubReadyState('complete');
    vi.resetModules();
    vi.doMock('./sessionReplay', () => {
      throw new Error('Failed to fetch dynamically imported module');
    });

    const sentry = await import('@sentry/react');
    (sentry.getClient as Mock).mockReturnValue({ addIntegration });

    const { scheduleSessionReplay: scheduleOverABrokenChunk } = await import('./loadSessionReplay');

    scheduleOverABrokenChunk();

    await vi.waitFor(() =>
      expect(sentry.captureException as Mock).toHaveBeenCalledWith(expect.any(Error), {
        level: 'warning',
      }),
    );
    expect(addIntegration).not.toHaveBeenCalled();
  });
});
