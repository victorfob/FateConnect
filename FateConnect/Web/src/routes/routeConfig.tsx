import { Navigate, type RouteObject } from 'react-router';

import { ErrorBoundary } from '@app/components/ErrorBoundary';
import { GuestLayout } from '@app/layouts/GuestLayout';
import { MainLayout } from '@app/layouts/MainLayout';
import { RootLayout } from '@app/layouts/RootLayout';
import { Home } from '@app/pages/Home';
import { LostAndFound } from '@app/pages/LostAndFound';
import { Menu } from '@app/pages/Menu';
import { Rides } from '@app/pages/Rides';
import { Signup } from '@app/pages/Signup';

import { RoutePathEnum } from './paths';

export const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: RoutePathEnum.ROOT, element: <Navigate to={RoutePathEnum.LANDING} replace /> },
      {
        element: <GuestLayout />,
        children: [
          { path: RoutePathEnum.LANDING, element: <Home /> },
          { path: RoutePathEnum.SIGNUP, element: <Signup /> },
        ],
      },
      {
        element: <MainLayout />,
        children: [
          { path: RoutePathEnum.MENU, element: <Menu /> },
          { path: RoutePathEnum.LOST_AND_FOUND, element: <LostAndFound /> },
          { path: RoutePathEnum.RIDES, element: <Rides /> },
        ],
      },
      { path: '*', element: <Navigate to={RoutePathEnum.LANDING} replace /> },
    ],
  },
];
