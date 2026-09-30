import { use, useEffect } from 'react';

import type { LeaveInterceptor } from '@app/providers/LeaveGuardProvider/@types';
import { LeaveGuardContext } from '@app/providers/LeaveGuardProvider/context';

export function useLeaveInterceptor(interceptor: LeaveInterceptor | null): void {
  const { setInterceptor } = use(LeaveGuardContext);

  useEffect(() => {
    setInterceptor(interceptor);

    return () => setInterceptor(null);
  }, [interceptor, setInterceptor]);
}
