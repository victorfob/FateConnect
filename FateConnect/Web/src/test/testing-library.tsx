import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Providers da aplicação. À medida que tema, rotas e cache de dados entrarem
 * (issues #49, #50 e #52), eles são adicionados aqui — e todo teste passa a
 * recebê-los sem alteração caso a caso.
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render, userEvent };
