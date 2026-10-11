import { useCallback, useEffect, useState } from 'react';

const NO_TIME_LEFT = 0;
const TICK_SECONDS = 1;
const TICK_MS = 1000;

export type Countdown = Readonly<{
  secondsLeft: number;
  running: boolean;
  start: (seconds: number) => void;
}>;

export function useCountdown(initialSeconds = NO_TIME_LEFT): Countdown {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const running = secondsLeft > NO_TIME_LEFT;

  useEffect(() => {
    if (!running) return;

    const ticker = setInterval(
      () => setSecondsLeft((seconds) => Math.max(seconds - TICK_SECONDS, NO_TIME_LEFT)),
      TICK_MS,
    );

    return () => clearInterval(ticker);
  }, [running]);

  const start = useCallback((seconds: number) => setSecondsLeft(seconds), []);

  return { secondsLeft, running, start };
}
