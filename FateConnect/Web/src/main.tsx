import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { AppErrorBoundary } from '@app/components/AppErrorBoundary';
import { initSentry, wrapCreateBrowserRouter } from '@app/observability';
import { AppProviders } from '@app/providers/AppProviders';
import { routeConfig } from '@app/routes';
import { reportUncaughtErrors } from '@app/utils/reportUncaughtErrors';

initSentry();
reportUncaughtErrors();

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html');

/**
 * Instrumentado para a transação no Sentry ser nomeada pela rota, e não pela
 * URL: sem isto cada item de achados e perdidos vira uma transação distinta.
 */
const router = wrapCreateBrowserRouter(createBrowserRouter)(routeConfig);

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>,
);
