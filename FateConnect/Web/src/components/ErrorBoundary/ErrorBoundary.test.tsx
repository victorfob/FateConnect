import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import * as C from './constants';
import { ErrorBoundary } from '.';

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
});
