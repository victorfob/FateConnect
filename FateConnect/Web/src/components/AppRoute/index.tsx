import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

import { SessionExpiredScreen } from '@app/components/SessionExpiredScreen';
import { useSessionStatus } from '@app/hooks/useSessionStatus';
import { SessionStatusEnum } from '@app/providers/SessionProvider/types';
import { RoutePathEnum } from '@app/routes/paths';
import { subscribeToSessionExpiry } from '@app/services/auth/sessionExpiry';

export function AppRoute() {
  const status = useSessionStatus();
  const [expiredWhileHere, setExpiredWhileHere] = useState(false);

  useEffect(() => subscribeToSessionExpiry(() => setExpiredWhileHere(true)), []);

  // Antes do desvio: a recusa apaga o token, e sem esta ordem quem foi
  // interrompido cairia na landing sem aviso nenhum.
  if (expiredWhileHere || status === SessionStatusEnum.EXPIRED) return <SessionExpiredScreen />;

  if (status === SessionStatusEnum.NONE) return <Navigate to={RoutePathEnum.LANDING} replace />;

  return <Outlet />;
}
