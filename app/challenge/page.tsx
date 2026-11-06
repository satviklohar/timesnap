"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { NameField, useName } from "@/components/NameField";
import { SnapPlayer, type SnapOutcome } from "@/components/SnapPlayer";
import { ResultCard } from "@/components/ResultCard";
import { CharacterSwitcher } from "@/components/CharacterSwitcher";
import { MAX_LIVES, challengeTarget, challengeTolerance, cleanInt, cleanName, cleanSeed, newSeed } from "@/lib/challenge";
import { fmtAbs, fmtTarget } from "@/lib/format";
import { scoreFor } from "@/lib/scoring";
import { loadChallengeBest, saveChallengeBest } from "@/lib/storage";

type Phase = "intro" | "play" | "result" | "over";

function Challenge() {
  const params = useSearchParams();
  const urlSeed = cleanSeed(params.get("s"));
  const beat = urlSeed && params.get("b") ? { score: cleanInt(params.get("b")), levels: cleanInt(params.get("l"), 999), name: cleanName(params.get("n")) } : null;

  const [seed, setSeed] = useState(urlSeed ?? "");
  useEffect(() => setSeed((s) => s || newSeed()), []);
  const [name, setName] = useName();

  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [last, setLast] = useState<(SnapOutcome & { pass: boolean }) | null>(null);
  const [best, setBest] = useState({ levels: 0, score: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => setBest(loadChallengeBest()), []);

  const target = useMemo(() => (seed ? challengeTarget(seed, level) : 10_000), [seed, level]);
  const tol = challengeTolerance(level);

  const reset = (fresh: boolean) => {
    if (fresh) setSeed(newSeed());
    setLevel(1); setLives(MAX_LIVES); setScore(0); setCleared(0); setLast(null);
    setPhase("play");
  };

  const onDone = (o: SnapOutcome) => {
    const diff = o.elapsedMs - target;
    const pass = !o.timedOut && Math.abs(diff) <= tol;
    const pts = scoreFor(diff, target) * level; // later levels are worth more
    setLast({ ...o, pass });
    if (pass) {
      setScore((s) => s + pts);
      setCleared((c) => c + 1);
    } else {
      setLives((l) => l - 1);
    }
    setPhase("result");
  };

  const next = () => {
    if (lives <= 0) return finish();
    setLevel((l) => l + 1);
    setPhase("play");
  };

  const finish = () => {
    if (cleared > best.levels || (cleared === best.levels && score > best.score)) {
      const b = { levels: cleared, score };
      saveChallengeBest(b);
      setBest(b);
    }
    setPhase("over");
  };

  const shareUrl = () => `${location.origin}/challenge?s=${seed}&b=${score}&l=${cleared}&n=${encodeURIComponent(name || "A friend")}`;
  const share = async () => {
    const url = shareUrl();
    const text = `I cleared ${cleared} TimeSnap levels (${score.toLocaleString()} pts). Beat me!`;
    try {
      if (navigator.share) return await navigator.share({ title: "TimeSnap Challenge", text, url });
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const beaten = beat && (cleared > beat.levels || (cleared === beat.levels && score > beat.score));

  return (
    <Shell title="Challenge">
      {phase !== "intro" && phase !== "over" && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-mono font-bold">LEVEL {String(level).padStart(2, "0")}</span>
          <span aria-label={`${lives} lives left`} className="flex gap-1.5">
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span key={i} className={`h-3.5 w-3.5 rotate-45 border-2 border-ink transition-colors ${i < lives ? "bg-orange" : "bg-transparent"}`} />
            ))}
          </span>
          <span className="num font-bold text-ink/70">{score.toLocaleString()} pts</span>
        </div>
      )}

      {phase === "intro" && (
        <div className="animate-rise space-y-5">
          <CharacterSwitcher />
          <h1 className="text-4xl font-bold tracking-tight">Challenge mode.</h1>
          {beat && (
            <p className="rounded-md border-2 border-ink bg-lime p-3 text-ink">
              <b>{beat.name}</b> cleared <b>{beat.levels}</b> levels with <b className="num">{beat.score.toLocaleString()}</b> pts. Can you beat it? (same targets)
            </p>
          )}
          <ul className="list-inside list-disc space-y-1 text-ink/70">
            <li>Random targets that grow longer and stranger each level.</li>
            <li>The pass window shrinks every level — miss it and lose a life ({MAX_LIVES} lives).</li>
            <li>Later levels are worth more points.</li>
          </ul>
          <NameField name={name} onChange={setName} />
          {best.levels > 0 && <p className="text-sm text-ink/50">Your best: {best.levels} levels · {best.score.toLocaleString()} pts</p>}
          <button className="btn-primary w-full !py-4 text-xl" onClick={() => reset(false)}>Start challenge</button>
        </div>
      )}

      {phase === "play" && (
        <SnapPlayer
          key={`${seed}-${level}-${lives}`}
          targetMs={target}
          onDone={onDone}
          label={`Stay within ±${tol} ms`}
        />
      )}

      {phase === "result" && last && (
        <div className="space-y-4">
          <ResultCard
            targetMs={target}
            elapsedMs={last.elapsedMs}
            timedOut={last.timedOut}
            extra={
              <p className={`mx-auto mt-4 w-fit rounded-md border-2 border-ink px-3 py-1 text-sm font-bold ${last.pass ? "bg-lime" : "bg-orange text-white"}`}>
                {last.pass ? `Level cleared (inside ±${tol} ms)` : `Missed by ${fmtAbs(last.elapsedMs - target - Math.sign(last.elapsedMs - target) * tol)} beyond the ±${tol} ms window`}
              </p>
            }
          />
          <button className="btn-primary w-full !py-4" onClick={next} autoFocus>
            {lives <= 0 ? "See final score" : `Level ${level + 1} · ${fmtTarget(challengeTarget(seed, level + 1))} →`}
          </button>
        </div>
      )}

      {phase === "over" && (
        <div className="animate-pop space-y-5 text-center">
          <p className="eyebrow">{beaten ? "New high mark" : "Run over"}</p>
          <h1 className="text-4xl font-bold tracking-tight">{beaten ? `You beat ${beat!.name}!` : "Game over"}</h1>
          <p className="num font-mono text-6xl font-bold">{score.toLocaleString()}<span className="text-lg text-ink/50"> pts</span></p>
          <p className="text-ink/70">{cleared} level{cleared === 1 ? "" : "s"} cleared</p>
          {beat && !beaten && <p className="text-sm text-ink">{beat.name}&apos;s mark: {beat.levels} levels · {beat.score.toLocaleString()} pts</p>}
          <NameField name={name} onChange={setName} />
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="btn-primary" onClick={share}>{copied ? "Link copied ✓" : "Challenge a friend"}</button>
            <button className="btn-ghost" onClick={() => reset(false)}>Retry same targets</button>
          </div>
          <button className="btn-ghost w-full" onClick={() => reset(true)}>New random run</button>
        </div>
      )}
    </Shell>
  );
}

export default function ChallengePage() {
  return (
    <Suspense>
      <Challenge />
    </Suspense>
  );
}
