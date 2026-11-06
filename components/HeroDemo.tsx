"use client";
import { useEffect, useRef, useState } from "react";
import { Stopwatch } from "./Stopwatch";
import { SnapTimer, eventTime } from "@/lib/timer";
import { fmtDiffWords, fmtSeconds } from "@/lib/format";
import { sfx, unlockAudio } from "@/lib/sound";
import { loadSolo } from "@/lib/storage";
import { fmtAbs } from "@/lib/format";

const DEMO_MS = 3000;

/** A tiny playable "try it" snap right in the hero. */
export function HeroDemo() {
  const timer = useRef(new SnapTimer());
  const [mode, setMode] = useState<"idle" | "running" | "revealed">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [played, setPlayed] = useState<{ total: number; best: number | null } | null>(null);

  useEffect(() => {
    const s = loadSolo();
    const bests = Object.values(s.best);
    setPlayed({ total: s.total, best: bests.length ? Math.min(...bests) : null });
  }, []);

  const press = (e: React.PointerEvent | React.MouseEvent) => {
    const at = eventTime(e.nativeEvent);
    if (mode === "running") {
      setElapsed(timer.current.stop(at));
      setMode("revealed");
      sfx.stop();
    } else {
      unlockAudio();
      timer.current.start(at);
      setMode("running");
      sfx.start();
    }
  };

  const diff = elapsed - DEMO_MS;
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center">
      <p className="eyebrow mb-1">Try it · target 00:03.00</p>
      <button
        onPointerDown={(e) => { e.preventDefault(); press(e); }}
        aria-label={mode === "running" ? "Stop" : "Start a 3 second demo"}
        className="group rounded-full p-2 outline-offset-4 transition-transform duration-150 hover:-rotate-3 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange"
      >
        <Stopwatch mode={mode} elapsedMs={elapsed} targetMs={DEMO_MS} className="h-52 w-auto sm:h-64" />
      </button>
      <div className="mt-2 min-h-[3.25rem] text-center" aria-live="polite">
        {mode === "idle" && <p className="font-bold">Tap the watch. Count to 3. Tap again.</p>}
        {mode === "running" && <p className="font-bold text-orange">Eyes closed. Tap when it&apos;s 3.</p>}
        {mode === "revealed" && (
          <div className="animate-pop">
            <p className="num font-mono text-2xl font-bold">{fmtSeconds(elapsed, 2)}s</p>
            <p className="text-sm font-bold">{fmtDiffWords(diff)} · <button className="underline decoration-orange decoration-2 underline-offset-2" onPointerDown={(e) => { e.preventDefault(); setMode("idle"); }}>again</button></p>
          </div>
        )}
      </div>
      {played && (
        <p className="mt-3 rounded-full border-2 border-ink bg-lime px-3 py-1 text-xs font-bold">
          {played.total ? `You've snapped ${played.total} time${played.total === 1 ? "" : "s"} · best miss ${fmtAbs(played.best ?? 0)}` : "No rounds on this device yet. Be the first."}
        </p>
      )}
    </div>
  );
}
