export type LeaveInterceptor = (leave: VoidFunction) => void;

export type LeaveGuard = Readonly<{
  requestLeave: LeaveInterceptor;
  setInterceptor: (interceptor: LeaveInterceptor | null) => void;
}>;
