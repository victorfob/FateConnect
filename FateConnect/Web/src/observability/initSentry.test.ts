import { init, setUser } from '@sentry/react';

import { tokenStorage } from '@app/services/auth/tokenStorage';
import { tokenWithName } from '@app/test/token';

import { initSentry } from './initSentry';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  reactRouterBrowserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  getClient: vi.fn(),
  setUser: vi.fn(),
}));

const mockInit = init as Mock;
const mockSetUser = setUser as Mock;

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

  it('should send only the browser identification and the referring page', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');

    initSentry();

    expect(initOptions()).toMatchObject({ dsn: 'https://public@sentry.test/1' });
    expect(initOptions().dataCollection).toEqual({
      userInfo: false,
      cookies: false,
      httpHeaders: { request: true, response: false },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
    });
  });

  it('should identify the errors by the email of the logged account, and forget it on sign out', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');
    tokenStorage.save(tokenWithName('Maria da Silva', undefined, 7, 'maria@fatec.sp.gov.br'));

    initSentry();

    expect(mockSetUser).toHaveBeenLastCalledWith({ email: 'maria@fatec.sp.gov.br' });

    tokenStorage.clear();

    expect(mockSetUser).toHaveBeenLastCalledWith(null);
  });

  it('should identify the account that signs in after the page opened', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@sentry.test/1');

    initSentry();

    expect(mockSetUser).toHaveBeenLastCalledWith(null);

    tokenStorage.save(tokenWithName('Maria da Silva', undefined, 7, 'maria@fatec.sp.gov.br'));

    expect(mockSetUser).toHaveBeenLastCalledWith({ email: 'maria@fatec.sp.gov.br' });
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
    expect(
      beforeSendSpan({
        name: `GET ${link}`,
        attributes: { 'url.full': link, 'url.query': 'token=abc123' },
      }),
    ).toEqual({ name: `GET ${page}`, attributes: { 'url.full': page } });
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
