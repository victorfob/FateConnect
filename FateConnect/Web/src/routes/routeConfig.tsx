import { Navigate, type RouteObject } from 'react-router';

import { GuestLayout } from '@app/layouts/GuestLayout';
import { MainLayout } from '@app/layouts/MainLayout';
import { RootLayout } from '@app/layouts/RootLayout';
import { Contact } from '@app/pages/Contact';
import { Home } from '@app/pages/Home';
import { LostAndFound } from '@app/pages/LostAndFound';
import { Menu } from '@app/pages/Menu';
import { Rides } from '@app/pages/Rides';
import { OfferRide } from '@app/pages/Rides/screens/OfferRide';
import { SearchRide } from '@app/pages/Rides/screens/SearchRide';
import { Signup } from '@app/pages/Signup';
import { RoutePathEnum } from './paths';

/**
 * Mesma topologia do front Angular: duas cascas (visitante e interna) e as
 * telas de carona aninhadas sob `/caronas`.
 */
export const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
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
          { path: RoutePathEnum.CONTACT, element: <Contact /> },
          {
            path: RoutePathEnum.RIDES,
            element: <Rides />,
            children: [
              { index: true, element: <Navigate to={RoutePathEnum.RIDES_SEARCH} replace /> },
              { path: RoutePathEnum.RIDES_SEARCH, element: <SearchRide /> },
              { path: RoutePathEnum.RIDES_OFFER, element: <OfferRide /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={RoutePathEnum.LANDING} replace /> },
    ],
  },
];
