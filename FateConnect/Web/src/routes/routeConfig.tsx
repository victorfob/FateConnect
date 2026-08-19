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
import { RoutePath } from './paths';

/**
 * Mesma topologia do front Angular: duas cascas (visitante e interna) e as
 * telas de carona aninhadas sob `/caronas`.
 */
export const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: RoutePath.ROOT, element: <Navigate to={RoutePath.LANDING} replace /> },
      {
        element: <GuestLayout />,
        children: [
          { path: RoutePath.LANDING, element: <Home /> },
          { path: RoutePath.SIGNUP, element: <Signup /> },
        ],
      },
      {
        element: <MainLayout />,
        children: [
          { path: RoutePath.MENU, element: <Menu /> },
          { path: RoutePath.LOST_AND_FOUND, element: <LostAndFound /> },
          { path: RoutePath.CONTACT, element: <Contact /> },
          {
            path: RoutePath.RIDES,
            element: <Rides />,
            children: [
              { index: true, element: <Navigate to={RoutePath.RIDES_SEARCH} replace /> },
              { path: RoutePath.RIDES_SEARCH, element: <SearchRide /> },
              { path: RoutePath.RIDES_OFFER, element: <OfferRide /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={RoutePath.LANDING} replace /> },
    ],
  },
];
