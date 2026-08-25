import * as C from '@app/components/CrashScreen/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import { AppErrorBoundary } from '.';

function ExplodingProvider(): never {
  throw new Error('provider quebrou');
}

// O React registra a quebra no console; silenciar mantém a saída da suíte
// legível sem esconder falha de teste.
describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should replace a broken provider tree with a recoverable message', () => {
    render(
      <AppErrorBoundary>
        <ExplodingProvider />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: C.ERROR_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.ERROR_DESCRIPTION)).toBeInTheDocument();
  });

  it('should keep rendering the tree while nothing breaks', () => {
    render(
      <AppErrorBoundary>
        <p>aplicação de pé</p>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('aplicação de pé')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: C.ERROR_TITLE })).not.toBeInTheDocument();
  });

  // Navegação de página inteira, não `Link`: com a árvore de providers quebrada
  // não há roteador para navegar por dentro.
  it('should leave the broken tree behind with a full page navigation', async () => {
    // `spyOn` não redefine `window.location` no jsdom — daí o stub do global.
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    render(
      <AppErrorBoundary>
        <ExplodingProvider />
      </AppErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: C.BACK_TO_START_LABEL }));

    expect(assign).toHaveBeenCalledWith(RoutePathEnum.LANDING);
  });
});
