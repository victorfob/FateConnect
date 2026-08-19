import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@app/providers/AppProviders';
import { routeConfig } from '@app/routes';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html');

const router = createBrowserRouter(routeConfig);

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
