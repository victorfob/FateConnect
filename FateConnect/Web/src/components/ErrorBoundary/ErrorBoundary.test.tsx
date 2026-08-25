import { createMemoryRouter, RouterProvider } from 'react-router';

import * as C from '@app/components/CrashScreen/constants';
import { captureException, ErrorTypeEnum } from '@app/observability';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import { ErrorBoundary } from '.';

// Mocka o SDK, não o nosso barrel: assim o `buildRouteErrorReport` roda de
// verdade e o teste prova a etiqueta que ele monta.
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  ErrorBoundary: () => null,
  wrapCreateBrowserRouter: (create: unknown) => create,
  init: vi.fn(),
  reactRouterBrowserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}));

const mockCaptureException = captureException as Mock;

function ExplodingScreen(): never {
  throw new Error('falha proposital');
}

function renderComponent() {
  const router = createMemoryRouter(
    [
      {
        errorElement: <ErrorBoundary />,
        children: [
          { path: RoutePathEnum.MENU, element: <ExplodingScreen /> },
          { path: RoutePathEnum.LANDING, element: <div>início</div> },
        ],
      },
    ],
    { initialEntries: [RoutePathEnum.MENU] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

// O React e o roteador registram o erro no console; silenciar mantém a saída da
// suíte legível sem esconder falha de teste.
describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should replace the crashed screen with a recoverable message', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.ERROR_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.ERROR_DESCRIPTION)).toBeInTheDocument();
  });

  it('should take the user back to the start', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: C.BACK_TO_START_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  // Erro de renderização não chega ao `window.onerror`: sem este relato, a tela
  // que quebrou é justamente a que ninguém fica sabendo.
  it('should report the crash, tagged with the route that broke', () => {
    renderComponent();

    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'falha proposital' }),
      { tags: { errorType: ErrorTypeEnum.ROUTE_BOUNDARY, route: RoutePathEnum.MENU }, extra: {} },
    );
  });
});
