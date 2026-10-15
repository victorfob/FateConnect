import { init } from '@sentry/react';

import { initSentry } from './initSentry';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  reactRouterBrowserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  getClient: vi.fn(),
}));

const mockInit = init as Mock;

function initOptions() {
  const initCall = mockInit.mock.lastCall;
  if (!initCall) throw new Error('init was not called');

  return initCall[0];
}

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

  it('should drop the query of every url in events, breadcrumbs and spans', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');
    const link =
      'https://fateconnect.test/desbloquear-conta?token=abc123&email=aluna%40fatec.sp.gov.br';
    const page = 'https://fateconnect.test/desbloquear-conta';

    initSentry();

    const { integrations, beforeBreadcrumb, beforeSendSpan } = initOptions();
    const stripUrlQueries = integrations.find(
      (integration?: { name: string }) => integration?.name === 'StripUrlQueries',
    );
    expect(stripUrlQueries.processEvent({ request: { url: link } })).toEqual({
      request: { url: page },
    });
    expect(beforeBreadcrumb({ data: { to: link } })).toEqual({ data: { to: page } });
    expect(beforeSendSpan({ description: `GET ${link}` })).toEqual({ description: `GET ${page}` });
  });

  it('should propagate the trace header only to our own apis', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');

    initSentry();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        tracePropagationTargets: ['localhost', 'https://api.fateconnect.test'],
      }),
    );
  });

  it('should tag the events with the environment the bundle was published to', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');
    vi.stubEnv('VITE_SENTRY_ENVIRONMENT', 'hml');

    initSentry();

    expect(mockInit).toHaveBeenCalledWith(expect.objectContaining({ environment: 'hml' }));
  });

  it('should fall back to the vite mode when no environment is declared', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');
    vi.stubEnv('VITE_SENTRY_ENVIRONMENT', '');

    initSentry();

    expect(mockInit).toHaveBeenCalledWith(expect.objectContaining({ environment: 'test' }));
  });
});
