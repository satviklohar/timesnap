"use client";
import { useEffect, useState } from "react";
import { useName } from "@/components/NameField";
import { useCharacter } from "@/components/Character";
import { Shell } from "@/components/Shell";
import { TargetPicker } from "@/components/TargetPicker";
import { SnapPlayer, type SnapOutcome } from "@/components/SnapPlayer";
import { Confetti } from "@/components/Confetti";
import { Avatar } from "@/components/ui";
import { Sprite } from "@/components/Character";
import { CHARACTERS } from "@/lib/characters";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { fmtDiff, fmtSeconds, fmtTarget } from "@/lib/format";
import { scoreFor } from "@/lib/scoring";
import { sfx, unlockAudio } from "@/lib/sound";

const HUES = [18, 80, 200, 300];
const VARY_POOL = [5, 7, 8, 10, 12, 15, 20, 25, 30, 45, 60].map((s) => s * 1000);

type Phase = "setup" | "handoff" | "play" | "sealed" | "round" | "final";

interface Settings {
  names: string[];
  chars: string[];
  targets: number[]; // per round
}

const makeTargets = (base: number, rounds: number, vary: boolean) => {
  if (!vary) return Array<number>(rounds).fill(base);
  const pool = [...VARY_POOL].sort(() => Math.random() - 0.5);
  return Array.from({ length: rounds }, (_, i) => pool[i % pool.length]);
};

export default function Multiplayer() {
  const [count, setCount] = useState(2);
  const [myName] = useName();
  const [myChar] = useCharacter();
  const [names, setNames] = useState(["", "", "", ""]);
  const [chars, setChars] = useState(CHARACTERS.map((c) => c.id).concat(CHARACTERS[0].id));
  const [target, setTarget] = useState(30_000);
  const [rounds, setRounds] = useState(3);
  const [vary, setVary] = useState(false);

  const [phase, setPhase] = useState<Phase>("setup");
  const [game, setGame] = useState<Settings>({ names: [], chars: [], targets: [] });
  const [round, setRound] = useState(0); // 0-based
  const [turn, setTurn] = useState(0);
  const [times, setTimes] = useState<number[][]>([]); // [round][player] = elapsed ms
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Player 1 is whoever is holding the device: prefill from their profile.
  useEffect(() => {
    setNames((n) => (n[0] === "" && myName ? [myName, ...n.slice(1)] : n));
    setChars((c) => [myChar, ...c.slice(1)]);
  }, [myName, myChar]);

  const start = (s: Settings) => {
    unlockAudio();
    setGame(s);
    setTimes(s.targets.map(() => []));
    setRound(0);
    setTurn(0);
    setPhase("handoff");
  };

  const begin = () =>
    start({
      names: Array.from({ length: count }, (_, i) => names[i].trim() || `Player ${i + 1}`),
      chars: chars.slice(0, count),
      targets: makeTargets(target, rounds, vary),
    });

  const onDone = (o: SnapOutcome) => {
    setTimes((t) => t.map((r, i) => (i === round ? [...r, o.elapsedMs] : r)));
    setPhase("sealed");
  };

  const afterSealed = () => {
    if (turn + 1 < game.names.length) {
      setTurn(turn + 1);
      setPhase("handoff");
    } else setPhase("round");
  };

  const afterRound = () => {
    if (round + 1 < game.targets.length) {
      setRound(round + 1);
      setTurn(0);
      setPhase("handoff");
    } else setPhase("final");
  };

  const targetMs = game.targets[round];
  const hue = (i: number) => HUES[i % HUES.length];

  return (
    <Shell title={phase === "setup" ? "Play with friends · same device" : `${game.names.length} players · round ${round + 1}/${game.targets.length}`}>
      {phase === "setup" && (
        <div className="animate-rise space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Pass the device.</h1>
            <p className="mt-1 text-ink/60">Everyone plays the same target, one after another. Times stay hidden until the round ends.</p>
          </div>

          <section>
            <h2 className="eyebrow mb-2">Players</h2>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={`rounded-md border-2 border-ink py-3 text-2xl font-bold transition active:scale-95 ${count === n ? "bg-ink text-lime" : "bg-white hover:bg-lime"}`}>
                  {n}
                </button>
              ))}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {Array.from({ length: count }, (_, i) => (
                <li key={i} className="space-y-2 rounded-lg border-2 border-ink bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar hue={hue(i)} name={names[i] || String(i + 1)} character={chars[i]} size={44} />
                    <input className="input" maxLength={14} placeholder={`Player ${i + 1}`} value={names[i]} onChange={(e) => setNames((n) => n.map((x, j) => (j === i ? e.target.value : x)))} />
                  </div>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Character for player ${i + 1}`}>
                    {CHARACTERS.map((c) => (
                      <button key={c.id} role="radio" aria-checked={chars[i] === c.id} aria-label={c.name} onClick={() => setChars((x) => x.map((v, j) => (j === i ? c.id : v)))}
                        className={`rounded-md p-0.5 transition active:scale-90 ${chars[i] === c.id ? "bg-ink" : "opacity-60 hover:opacity-100"}`}>
                        <Sprite id={c.id} size={32} framed={false} className="rounded-sm" />
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 border-t-2 border-ink pt-4">
            <h2 className="eyebrow">Target</h2>
            <TargetPicker value={target} onChange={setTarget} />
            <label className="flex items-center gap-3 text-sm text-ink/70">
              <input type="checkbox" className="h-5 w-5 accent-orange" checked={vary} onChange={(e) => setVary(e.target.checked)} />
              Different random target each round
            </label>
          </section>

          <section className="border-t-2 border-ink pt-4">
            <h2 className="eyebrow mb-2">Rounds</h2>
            <div className="flex gap-2">
              {[1, 3, 5, 7].map((r) => (
                <button key={r} className={`chip ${rounds === r ? "chip-on" : ""}`} onClick={() => setRounds(r)}>{r}</button>
              ))}
            </div>
          </section>

          <button className="btn-primary w-full !py-4 text-xl" onClick={begin}>Start game →</button>
        </div>
      )}

      {phase === "handoff" && (
        <div className="m-auto w-full animate-pop space-y-5 text-center">
          <p className="eyebrow">Pass the device to</p>
          <div className="flex justify-center"><Sprite id={game.chars[turn]} size={104} mood="cheer" /></div>
          <h1 className="text-5xl font-bold tracking-tight">{game.names[turn]}</h1>
          <p className="text-ink/60">Target <b className="num font-mono text-ink">{fmtTarget(targetMs)}</b> · turn {turn + 1} of {game.names.length}</p>
          <button
            className="btn-primary w-full !py-5 text-xl sm:max-w-sm"
            autoFocus
            onClick={() => setTimeout(() => setPhase("play"), 60)}
          >
            I&apos;m ready
          </button>
        </div>
      )}

      {phase === "play" && (
        <SnapPlayer key={`${round}-${turn}`} targetMs={targetMs} onDone={onDone} label={`${game.names[turn]} · round ${round + 1}`} />
      )}

      {phase === "sealed" && (
        <div className="m-auto w-full animate-pop space-y-4 text-center">
          <p className="eyebrow">Locked in</p>
          <h2 className="text-4xl font-bold tracking-tight">{game.names[turn]}&apos;s time is sealed.</h2>
          <p className="text-ink/60">No peeking. Results come after everyone plays.</p>
          <button className="btn-primary w-full !py-4 sm:max-w-sm" autoFocus onClick={() => setTimeout(afterSealed, 60)}>
            {turn + 1 < game.names.length ? `Pass to ${game.names[turn + 1]} →` : "Reveal results →"}
          </button>
        </div>
      )}

      {(phase === "round" || phase === "final") && (
        <Results
          game={game}
          times={times}
          round={round}
          final={phase === "final"}
          hue={hue}
          onNext={afterRound}
          onNew={() => setPhase("setup")}
          onAgain={() => start({ names: game.names, chars: game.chars, targets: makeTargets(target, game.targets.length, vary) })}
        />
      )}
      {phase !== "setup" && (
        <button className="mx-auto mt-6 text-xs font-bold text-ink/40 underline" onClick={() => setConfirmEnd(true)}>End game</button>
      )}
      <ConfirmDialog
        open={confirmEnd}
        title="End this game?"
        body="Scores so far will be lost and you'll go back to setup."
        confirmLabel="End game"
        onConfirm={() => (setConfirmEnd(false), setPhase("setup"))}
        onCancel={() => setConfirmEnd(false)}
      />
    </Shell>
  );
}

function Results({ game, times, round, final, hue, onNext, onNew, onAgain }: { game: Settings; times: number[][]; round: number; final: boolean; hue: (i: number) => number; onNext: () => void; onNew: () => void; onAgain: () => void }) {
  const rowsFor = (r: number) =>
    game.names
      .map((name, i) => {
        const elapsed = times[r][i];
        const diff = elapsed - game.targets[r];
        return { i, name, elapsed, diff, score: scoreFor(diff, game.targets[r]) };
      })
      .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));

  const rows = rowsFor(round);
  const standings = game.names
    .map((name, i) => {
      let total = 0;
      let wins = 0;
      for (let r = 0; r <= round; r++) {
        const rr = rowsFor(r);
        total += rr.find((x) => x.i === i)!.score;
        if (rr[0].i === i) wins++;
      }
      return { i, name, total, wins };
    })
    .sort((a, b) => b.total - a.total);

  const hero = final ? { i: standings[0].i, name: standings[0].name } : { i: rows[0].i, name: rows[0].name };
  const target = game.targets[round];
  // Sound once on mount.
  useEffect(() => {
    const t = setTimeout(() => (final ? sfx.win() : sfx.good()), 150);
    return () => clearTimeout(t);
  }, [final, round]);

  return (
    <div className="animate-rise space-y-6">
      <section className="relative overflow-hidden rounded-lg border-2 border-ink bg-lime p-5">
        {final && <Confetti />}
        <p className="eyebrow !text-ink/70">{final ? "Champion" : `Round ${round + 1} · closest to ${fmtTarget(target)}`}</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar hue={hue(hero.i)} name={hero.name} character={game.chars[hero.i]} size={64} />
          <div className="min-w-0">
            <h2 className="truncate text-4xl font-bold leading-none tracking-tight sm:text-5xl">{hero.name}</h2>
            <p className="num mt-1 font-mono text-sm font-bold">
              {final ? `${standings[0].total.toLocaleString()} pts · ${standings[0].wins} round win${standings[0].wins === 1 ? "" : "s"}` : `${fmtSeconds(rows[0].elapsed, 3)}s · ${fmtDiff(rows[0].diff)}`}
            </p>
          </div>
        </div>
        <span className="absolute right-3 top-3 animate-stamp border-2 border-orange px-2 py-0.5 font-mono text-xs font-bold uppercase text-orange">{final ? "Winner" : "Closest"}</span>
      </section>

      <section>
        <h2 className="eyebrow mb-2">Round {round + 1} · target {fmtTarget(target)}</h2>
        <ol className="divide-y-2 divide-ink overflow-hidden rounded-lg border-2 border-ink bg-white">
          {rows.map((r, k) => (
            <li key={r.i} className={`flex items-center gap-3 px-3 py-2.5 ${k === 0 ? "bg-orange/10" : ""}`} style={{ animation: `rise .35s ${k * 80}ms both` }}>
              <span className="w-5 text-center font-mono font-bold text-ink/50">{k + 1}</span>
              <Avatar hue={hue(r.i)} name={r.name} character={game.chars[r.i]} size={34} />
              <span className="min-w-0 flex-1 truncate font-bold">{r.name}</span>
              <span className="num text-right font-mono text-sm leading-tight">
                <b>{fmtSeconds(r.elapsed, 3)}s</b>
                <span className={`block text-xs ${k === 0 ? "font-bold text-orange" : "text-ink/55"}`}>{fmtDiff(r.diff)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="eyebrow mb-2">{final ? "Final standings" : "Standings"}</h2>
        <ol className="space-y-1.5">
          {standings.map((s, k) => (
            <li key={s.i} className="flex items-center gap-3 border-b border-ink/15 pb-1.5">
              <span className={`grid h-7 w-7 place-items-center rounded-full font-mono text-sm font-bold ${k === 0 ? "bg-ink text-lime" : "text-ink/50"}`}>{k + 1}</span>
              <span className="min-w-0 flex-1 truncate font-bold">{s.name}</span>
              <span className="num font-mono font-bold">{s.total.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </section>

      {final ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="btn-primary !py-4" onClick={onAgain}>Play again</button>
          <button className="btn-ghost !py-4" onClick={onNew}>New challenge</button>
        </div>
      ) : (
        <button className="btn-primary w-full !py-4" onClick={onNext}>
          {round + 1 >= game.targets.length ? "Show final results" : `Start round ${round + 2} →`}
        </button>
      )}
    </div>
  );
}
