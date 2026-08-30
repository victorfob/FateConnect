import { Navigate, Outlet } from 'react-router';

import { useSessionStatus } from '@app/hooks/useSessionStatus';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { RoutePathEnum } from '@app/routes/paths';

export function VisitorRoute() {
  if (useSessionStatus() === SessionStatusEnum.VALID)
    return <Navigate to={RoutePathEnum.MENU} replace />;

  return <Outlet />;
}
