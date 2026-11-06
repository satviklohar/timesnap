"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fmtClock } from "@/lib/format";
import { sfx, unlockAudio } from "@/lib/sound";
import { SnapTimer, eventTime, roundTimeoutMs } from "@/lib/timer";
import { Stopwatch } from "./Stopwatch";

export interface SnapOutcome {
  elapsedMs: number;
  timedOut: boolean;
}

/**
 * The core mechanic. The elapsed time is `stopTimestamp - startTimestamp` on the
 * monotonic performance.now() timeline, using the input events' own timestamps.
 * Nothing about the running time is rendered, and no periodic animation is shown
 * that could be counted.
 */
export function SnapPlayer({
  targetMs,
  onDone,
  label,
  hint,
}: {
  targetMs: number;
  onDone: (o: SnapOutcome) => void;
  label?: string;
  hint?: string;
}) {
  const timer = useRef(new SnapTimer());
  const [running, setRunning] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const clear = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  };

  const start = useCallback(
    (at: number) => {
      if (timer.current.running) return;
      unlockAudio();
      timer.current.start(at);
      setRunning(true);
      sfx.start();
      timeout.current = setTimeout(() => {
        const ms = timer.current.stop();
        setRunning(false);
        doneRef.current({ elapsedMs: ms, timedOut: true });
      }, roundTimeoutMs(targetMs));
    },
    [targetMs],
  );

  const stop = useCallback((at: number) => {
    if (!timer.current.running) return;
    const ms = timer.current.stop(at);
    clear();
    setRunning(false);
    sfx.stop();
    doneRef.current({ elapsedMs: ms, timedOut: false });
  }, []);

  // Keyboard: Space / Enter toggles. Uses keydown (not click) to avoid release latency.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      if (e.repeat) return;
      timer.current.running ? stop(eventTime(e)) : start(eventTime(e));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, stop]);

  useEffect(
    () => () => {
      clear();
      timer.current.cancel();
    },
    [],
  );

  const press = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const at = eventTime(e.nativeEvent);
    running ? stop(at) : start(at);
  };

  return (
    <div className="flex flex-1 animate-rise flex-col items-center text-center">
      {label && <p className="eyebrow">{label}</p>}
      <div className="mt-2">
        <p className="eyebrow !text-ink/50">Target</p>
        <p className="num font-mono text-4xl font-bold tracking-tight sm:text-5xl" aria-label={`Target ${fmtClock(targetMs)}`}>
          {fmtClock(targetMs)}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-3">
        <Stopwatch mode={running ? "running" : "idle"} className={`w-auto transition-transform duration-200 ${running ? "scale-95" : ""} h-[min(36dvh,17rem)]`} />
      </div>

      <button
        // Pointer-down fires earlier than click, shaving input latency.
        onPointerDown={press}
        onKeyDown={(e) => e.key === " " && e.preventDefault()}
        autoFocus={running}
        aria-label={running ? "Stop timer" : "Start timer"}
        className={`w-full rounded-lg border-2 border-ink py-5 text-3xl font-bold uppercase tracking-widest shadow-[5px_5px_0_#171717] transition duration-100 active:translate-x-[5px] active:translate-y-[5px] active:shadow-none sm:max-w-sm sm:py-6 ${
          running ? "bg-orange text-white" : "bg-lime text-ink"
        }`}
      >
        {running ? "Stop" : "Start"}
      </button>
      <p className="mt-3 min-h-[2.5rem] max-w-xs text-sm text-ink/60">
        {running ? "Timer hidden. Count it in your head." : (hint ?? "Press START or Space. The clock disappears.")}
      </p>
    </div>
  );
}
