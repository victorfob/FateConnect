import { Navigate, Outlet, useLocation } from 'react-router';

import { useSessionStatus } from '@app/hooks/useSessionStatus';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { signInReturnState } from '@app/utils/signInReturn';

/** Sem sessão, passa pelo login e volta para a mesma URL, em vez de parar no menu. */
export function SignInFirstRoute() {
  const status = useSessionStatus();
  const { pathname, search } = useLocation();

  if (status === SessionStatusEnum.VALID) return <Outlet />;

  return (
    <Navigate
      to={{ pathname: RoutePathEnum.LANDING, hash: `#${LandingSectionEnum.LOGIN}` }}
      state={signInReturnState(`${pathname}${search}`)}
      replace
    />
  );
}
