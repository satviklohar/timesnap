"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TargetPicker } from "@/components/TargetPicker";
import { SnapPlayer, type SnapOutcome } from "@/components/SnapPlayer";
import { ResultCard } from "@/components/ResultCard";
import { CharacterSwitcher } from "@/components/CharacterSwitcher";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { fmtAbs, fmtClock, fmtDiff, fmtSeconds, fmtTarget } from "@/lib/format";
import { scoreFor } from "@/lib/scoring";
import { clearSolo, loadSolo, recordSolo, type SoloStats } from "@/lib/storage";

type Phase = "pick" | "play" | "result";

export default function SoloPage() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [target, setTarget] = useState(10_000);
  const [last, setLast] = useState<(SnapOutcome & { record: boolean }) | null>(null);
  const [stats, setStats] = useState<SoloStats>({ history: [], best: {}, total: 0 });

  useEffect(() => setStats(loadSolo()), []);

  // Space / Enter replays from the result screen.
  useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
        e.preventDefault();
        setPhase("play");
      }
    };
    // Small delay so the STOP keypress itself doesn't instantly trigger a replay.
    const t = setTimeout(() => window.addEventListener("keydown", onKey), 500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  const onDone = (o: SnapOutcome) => {
    const diff = o.elapsedMs - target;
    const { stats: s, isRecord } = recordSolo({ targetMs: target, elapsedMs: o.elapsedMs, diffMs: diff, score: scoreFor(diff, target), at: Date.now() });
    setStats(s);
    setLast({ ...o, record: isRecord });
    setPhase("result");
  };

  const bestForTarget = stats.best[String(target)];
  const attemptsForTarget = stats.history.filter((h) => h.targetMs === target);
  const avg = attemptsForTarget.length ? attemptsForTarget.reduce((s, h) => s + Math.abs(h.diffMs), 0) / attemptsForTarget.length : null;

  return (
    <Shell title={phase === "pick" ? "Solo · choose a target" : "Solo"}>
      {phase === "pick" && (
        <div className="animate-rise space-y-6">
          <CharacterSwitcher />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Pick your target.</h1>
            <p className="mt-1 text-ink/60">Then try to stop right on it with the clock hidden.</p>
          </div>
          <TargetPicker value={target} onChange={setTarget} />
          <button className="btn-primary w-full !py-4 text-xl" onClick={() => setPhase("play")}>
            Play {fmtClock(target).replace(/^00:/, "")} →
          </button>
          <Stats stats={stats} onClear={() => (clearSolo(), setStats(loadSolo()))} />
        </div>
      )}

      {phase === "play" && (
        <>
          <SnapPlayer key={`${target}-${stats.total}`} targetMs={target} onDone={onDone} label={`Round ${stats.total + 1}`} />
          <button className="mx-auto mt-2 text-sm font-bold underline decoration-orange decoration-2 underline-offset-4" onClick={() => setPhase("pick")}>Change target</button>
        </>
      )}

      {phase === "result" && last && (
        <div className="space-y-5">
          <ResultCard
            targetMs={target}
            elapsedMs={last.elapsedMs}
            timedOut={last.timedOut}
            record={last.record}
            extra={
              !last.record && (
                <p className="mt-3 text-sm text-ink/60">
                  Best for {fmtTarget(target)}: <b className="num font-mono text-ink">{fmtAbs(bestForTarget ?? 0)}</b>
                  {avg !== null && <> · avg miss <b className="num font-mono text-ink">{fmtAbs(avg)}</b></>}
                </p>
              )
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary !py-4" onClick={() => setPhase("play")} autoFocus>Play again</button>
            <button className="btn-ghost !py-4" onClick={() => setPhase("pick")}>New target</button>
          </div>
          <CharacterSwitcher />
          <p className="text-center text-xs text-ink/40">Press Space to replay</p>
        </div>
      )}
    </Shell>
  );
}

function Stats({ stats, onClear }: { stats: SoloStats; onClear: () => void }) {
  const [ask, setAsk] = useState(false);
  const records = Object.entries(stats.best).sort((a, b) => Number(a[0]) - Number(b[0]));
  if (!stats.total) return <p className="border-t-2 border-ink pt-4 text-sm text-ink/50">No rounds yet. Your records will show up here.</p>;
  return (
    <section className="border-t-2 border-ink pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="eyebrow">Personal records</h2>
        <button className="text-xs font-bold text-ink/40 underline" onClick={() => setAsk(true)}>reset</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {records.map(([t, d]) => (
          <div key={t} className="rounded-md border-2 border-ink bg-white px-3 py-1.5">
            <p className="eyebrow">{fmtTarget(Number(t))}</p>
            <p className="num font-mono font-bold">{fmtAbs(d)}</p>
          </div>
        ))}
      </div>
      <h3 className="eyebrow mb-1 mt-5">Recent · {stats.total} total</h3>
      <ul className="divide-y divide-ink/10 text-sm">
        {stats.history.slice(0, 8).map((h) => (
          <li key={h.at} className="flex justify-between py-1.5">
            <span className="text-ink/60">{fmtTarget(h.targetMs)} → <span className="num font-mono text-ink">{fmtSeconds(h.elapsedMs, 3)}s</span></span>
            <span className={`num font-mono font-bold ${Math.abs(h.diffMs) <= 150 ? "rounded bg-lime px-1.5" : "text-ink/70"}`}>{fmtDiff(h.diffMs)}</span>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={ask}
        title="Reset your stats?"
        body="This deletes all personal records and round history on this device."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={() => (setAsk(false), onClear())}
        onCancel={() => setAsk(false)}
      />
    </section>
  );
}
