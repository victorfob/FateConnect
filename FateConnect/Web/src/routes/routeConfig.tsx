import { Navigate, type RouteObject } from 'react-router';

import { AdminRoute } from '@app/components/AdminRoute';
import { AppRoute } from '@app/components/AppRoute';
import { ErrorBoundary } from '@app/components/ErrorBoundary';
import { VisitorRoute } from '@app/components/VisitorRoute';
import { GuestLayout } from '@app/layouts/GuestLayout';
import { MainLayout } from '@app/layouts/MainLayout';
import { RootLayout } from '@app/layouts/RootLayout';
import { ConfirmEmail } from '@app/pages/ConfirmEmail';
import { ForgotPassword } from '@app/pages/ForgotPassword';
import { Home } from '@app/pages/Home';
import { LostAndFound } from '@app/pages/LostAndFound';
import { Management } from '@app/pages/Management';
import { Menu } from '@app/pages/Menu';
import { Notifications } from '@app/pages/Notifications';
import { Preferences } from '@app/pages/Preferences';
import { Profile } from '@app/pages/Profile';
import { Reports } from '@app/pages/Reports';
import { ResetPassword } from '@app/pages/ResetPassword';
import { Rides } from '@app/pages/Rides';
import { Signup } from '@app/pages/Signup';
import { UnlockAccount } from '@app/pages/UnlockAccount';

import { RoutePathEnum } from './paths';

export const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <VisitorRoute />,
        children: [
          {
            element: <GuestLayout />,
            children: [
              { path: RoutePathEnum.LANDING, element: <Home /> },
              { path: RoutePathEnum.SIGNUP, element: <Signup /> },
              { path: RoutePathEnum.UNLOCK_ACCOUNT, element: <UnlockAccount /> },
              { path: RoutePathEnum.CONFIRM_EMAIL, element: <ConfirmEmail /> },
              { path: RoutePathEnum.FORGOT_PASSWORD, element: <ForgotPassword /> },
              { path: RoutePathEnum.RESET_PASSWORD, element: <ResetPassword /> },
            ],
          },
        ],
      },
      {
        element: <AppRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: RoutePathEnum.MENU, element: <Menu /> },
              { path: RoutePathEnum.LOST_AND_FOUND, element: <LostAndFound /> },
              { path: RoutePathEnum.RIDES, element: <Rides /> },
              { path: RoutePathEnum.PREFERENCES, element: <Preferences /> },
              {
                path: RoutePathEnum.PROFILE,
                element: <Profile />,
              },
              { path: RoutePathEnum.REPORTS, element: <Reports /> },
              {
                element: <AdminRoute />,
                children: [{ path: RoutePathEnum.MANAGEMENT, element: <Management /> }],
              },
              { path: RoutePathEnum.NOTIFICATIONS, element: <Notifications /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={RoutePathEnum.LANDING} replace /> },
    ],
  },
];
