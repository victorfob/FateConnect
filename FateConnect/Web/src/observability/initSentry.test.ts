import { init } from '@sentry/react';

import { initSentry } from './initSentry';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  reactRouterBrowserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}));

const mockInit = init as Mock;

describe('initSentry', () => {
  // Sem `unstubAllEnvs`: ele apagaria também os stubs de ambiente do
  // vitest.setup.ts, e as URLs das APIs desapareceriam no meio da suíte.
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should stay inert without a dsn, so development and tests send nothing', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');

    initSentry();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('should not let request bodies or user data leave the browser', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');

    initSentry();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@sentry.test/1',
        dataCollection: { userInfo: false, httpBodies: [] },
        enableLogs: false,
      }),
    );
  });

  it('should propagate the trace header only to our own apis', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');

    initSentry();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        tracePropagationTargets: [
          'localhost',
          'https://api.fateconnect.test',
          'https://rides.fateconnect.test',
        ],
      }),
    );
  });
});
