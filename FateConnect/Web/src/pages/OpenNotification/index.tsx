import { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';

import { NotificationRedirect } from './components/NotificationRedirect';
import { pushedNotificationOf } from './helpers';

/** Onde o toque no aviso do push cai: marca como lido e segue para o destino da campainha. */
export function OpenNotification() {
  const [searchParams] = useSearchParams();
  const notification = useMemo(() => pushedNotificationOf(searchParams), [searchParams]);

  if (!notification) return <Navigate to={RoutePathEnum.NOTIFICATIONS} replace />;

  return <NotificationRedirect notification={notification} />;
}
