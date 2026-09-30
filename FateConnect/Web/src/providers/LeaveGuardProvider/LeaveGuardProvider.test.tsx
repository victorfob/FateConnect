import { use } from 'react';

import { renderHook } from '@app/test/testing-library';

import { LeaveGuardContext } from './context';
import { LeaveGuardProvider } from '.';

const useLeaveGuard = () => use(LeaveGuardContext);

describe('LeaveGuardProvider', () => {
  it('should let the leave through while no screen holds it', () => {
    const leave = vi.fn();
    const { result } = renderHook(useLeaveGuard, { wrapper: LeaveGuardProvider });

    result.current.requestLeave(leave);

    expect(leave).toHaveBeenCalledOnce();
  });

  it('should hand the leave to the screen that holds it', () => {
    const leave = vi.fn();
    const interceptor = vi.fn();
    const { result } = renderHook(useLeaveGuard, { wrapper: LeaveGuardProvider });

    result.current.setInterceptor(interceptor);
    result.current.requestLeave(leave);

    expect(interceptor).toHaveBeenCalledWith(leave);
    expect(leave).not.toHaveBeenCalled();
  });

  it('should let the leave through outside the provider', () => {
    const leave = vi.fn();
    const { result } = renderHook(useLeaveGuard);

    result.current.setInterceptor(vi.fn());
    result.current.requestLeave(leave);

    expect(leave).toHaveBeenCalledOnce();
  });
});
