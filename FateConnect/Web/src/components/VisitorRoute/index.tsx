import { Navigate, Outlet, useLocation } from 'react-router';

import { useSessionStatus } from '@app/hooks/useSessionStatus';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { afterSignInPath } from '@app/utils/signInReturn';

export function VisitorRoute() {
  const { state } = useLocation();

  if (useSessionStatus() === SessionStatusEnum.VALID)
    return <Navigate to={afterSignInPath(state)} replace />;

  return <Outlet />;
}
