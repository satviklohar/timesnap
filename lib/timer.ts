/**
 * Monotonic stopwatch. Uses performance.now() (immune to system clock changes
 * and to timer throttling) — elapsed time is a single subtraction, never a
 * count of interval ticks.
 */

/** Best available timestamp for an input event, on the performance.now() timeline. */
export function eventTime(e?: { timeStamp: number }): number {
  const now = performance.now();
  if (e && e.timeStamp > 0 && Math.abs(now - e.timeStamp) < 1000) return e.timeStamp;
  return now;
}

export class SnapTimer {
  private t0: number | null = null;

  get running() {
    return this.t0 !== null;
  }

  start(at: number = performance.now()) {
    this.t0 = at;
  }

  /** Returns elapsed ms (float) and resets. */
  stop(at: number = performance.now()): number {
    if (this.t0 === null) return 0;
    const elapsed = Math.max(0, at - this.t0);
    this.t0 = null;
    return elapsed;
  }

  cancel() {
    this.t0 = null;
  }
}

/** Give up on a round that runs absurdly long. */
export const roundTimeoutMs = (targetMs: number) => Math.max(targetMs * 2.5, targetMs + 8000);
