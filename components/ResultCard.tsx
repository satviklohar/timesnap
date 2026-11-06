"use client";
import { useEffect, useState } from "react";
import { fmtDiff, fmtDiffWords, fmtSeconds, fmtTarget } from "@/lib/format";
import { isCelebration, ratingFor, scoreFor } from "@/lib/scoring";
import { sfx } from "@/lib/sound";
import { Confetti } from "./Confetti";
import { Stopwatch } from "./Stopwatch";
import { Sprite, useCharacter } from "./Character";

/** Counts up to `to` so the stopped time "lands" instead of just appearing. */
function useCountUp(to: number, ms = 800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

export function ResultCard({
  targetMs,
  elapsedMs,
  timedOut,
  record,
  extra,
  silent,
}: {
  targetMs: number;
  elapsedMs: number;
  timedOut?: boolean;
  record?: boolean;
  extra?: React.ReactNode;
  silent?: boolean;
}) {
  const diff = elapsedMs - targetMs;
  const rating = ratingFor(Math.abs(diff));
  const score = scoreFor(diff, targetMs);
  const celebrate = isCelebration(Math.abs(diff));
  const shown = useCountUp(elapsedMs);
  const [character] = useCharacter();
  const mood = celebrate ? "cheer" : Math.abs(diff) > 1000 ? "oops" : "idle";

  useEffect(() => {
    if (silent) return;
    const t = setTimeout(() => (celebrate ? sfx.win() : Math.abs(diff) <= 1000 ? sfx.good() : sfx.miss()), 250);
    return () => clearTimeout(t);
  }, [celebrate, diff, silent]);

  return (
    <div className="animate-rise text-center">
      {celebrate && <Confetti />}
      <p className="eyebrow">{timedOut ? "Timed out. You waited too long" : `Target ${fmtTarget(targetMs)}`}</p>

      <div className="relative mx-auto mt-1 w-fit">
        <Stopwatch mode="revealed" elapsedMs={elapsedMs} targetMs={targetMs} className="mx-auto h-[min(24dvh,12rem)] w-auto" />
        <span className="absolute -left-[4.5rem] bottom-0 sm:-left-24">
          <Sprite id={character} size={56} mood={mood} />
        </span>
        {record && (
          <span className="absolute -right-10 top-2 animate-stamp border-2 border-ink bg-lime px-2 py-1 font-mono text-[11px] font-bold uppercase leading-tight shadow-[2px_2px_0_#171717] sm:-right-16">
            New<br />record
          </span>
        )}
      </div>

      <p className="num mt-2 font-mono text-6xl font-bold tracking-tight sm:text-7xl">
        {fmtSeconds(shown, 2)}<span className="text-2xl text-ink/40">s</span>
      </p>
      <div className="animate-fade">
        <p className={`mt-1 text-xl font-bold ${Math.abs(diff) <= 150 ? "text-ink" : "text-orange"}`}>{fmtDiffWords(diff)}</p>
        <p className="num font-mono text-sm text-ink/55">{fmtDiff(diff)}</p>

        <div className="mx-auto mt-4 inline-flex items-stretch overflow-hidden rounded-md border-2 border-ink text-left">
          <div className="bg-white px-4 py-2">
            <p className="eyebrow">Verdict</p>
            <p className="font-bold">{rating.label}</p>
          </div>
          <div className="border-l-2 border-ink bg-lime px-4 py-2">
            <p className="eyebrow !text-ink/70">Points</p>
            <p className="num font-mono font-bold">{score.toLocaleString()}</p>
          </div>
        </div>
        {extra}
      </div>
    </div>
  );
}
