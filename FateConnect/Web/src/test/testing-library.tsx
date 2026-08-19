import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '@ds';

/**
 * Providers da aplicação. Rotas e cache de dados entram aqui nas issues #50 e #52,
 * e todo teste passa a recebê-los sem alteração caso a caso.
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render, userEvent };
