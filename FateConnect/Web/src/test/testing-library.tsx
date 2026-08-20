import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppProviders } from '@app/providers/AppProviders';

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AppProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render, userEvent };
