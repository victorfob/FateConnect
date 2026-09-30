import { useMemo, useRef, type ReactNode } from 'react';

import type { LeaveGuard, LeaveInterceptor } from './@types';
import { LeaveGuardContext } from './context';

type LeaveGuardProviderProps = Readonly<{ children: ReactNode }>;

/** Sair da conta não passa pelo roteador, então é por aqui que a tela aberta a segura. */
export function LeaveGuardProvider({ children }: LeaveGuardProviderProps) {
  const interceptorRef = useRef<LeaveInterceptor | null>(null);

  const guard = useMemo<LeaveGuard>(
    () => ({
      requestLeave(leave) {
        const interceptor = interceptorRef.current;
        if (!interceptor) {
          leave();
          return;
        }

        interceptor(leave);
      },
      setInterceptor(interceptor) {
        interceptorRef.current = interceptor;
      },
    }),
    [],
  );

  return <LeaveGuardContext value={guard}>{children}</LeaveGuardContext>;
}
