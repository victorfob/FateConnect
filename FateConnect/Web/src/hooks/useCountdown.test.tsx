import { act, renderHook } from '@app/test/testing-library';

import { useCountdown } from './useCountdown';

const ONE_SECOND_MS = 1000;

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should count down one second at a time and stop at zero', () => {
    const { result } = renderHook(() => useCountdown(2));

    expect(result.current.secondsLeft).toBe(2);

    act(() => vi.advanceTimersByTime(ONE_SECOND_MS));
    expect(result.current.secondsLeft).toBe(1);

    act(() => vi.advanceTimersByTime(ONE_SECOND_MS));
    expect(result.current.secondsLeft).toBe(0);

    act(() => vi.advanceTimersByTime(ONE_SECOND_MS));
    expect(result.current.secondsLeft).toBe(0);
  });

  it('should start idle and count again from the seconds it is given', () => {
    const { result } = renderHook(() => useCountdown());

    expect(result.current.secondsLeft).toBe(0);

    act(() => result.current.start(3));
    expect(result.current.secondsLeft).toBe(3);

    act(() => vi.advanceTimersByTime(ONE_SECOND_MS));
    expect(result.current.secondsLeft).toBe(2);
  });
});
