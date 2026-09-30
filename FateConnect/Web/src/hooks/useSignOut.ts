import { use, useCallback } from 'react';

import { LeaveGuardContext } from '@app/providers/LeaveGuardProvider/context';
import { logout } from '@app/services/auth/authService';

export function useSignOut(): VoidFunction {
  const { requestLeave } = use(LeaveGuardContext);

  return useCallback(() => requestLeave(logout), [requestLeave]);
}
