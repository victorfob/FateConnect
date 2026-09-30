import { createContext } from 'react';

import type { LeaveGuard } from './@types';

export const LeaveGuardContext = createContext<LeaveGuard>({
  requestLeave: (leave) => leave(),
  setInterceptor: () => undefined,
});
