import Link from "next/link";
import { Shell } from "@/components/Shell";
import { HeroDemo } from "@/components/HeroDemo";
import { LogoMark } from "@/components/Stopwatch";
import { CharacterSection } from "@/components/CharacterSection";

const steps = [
  ["01", "Pick a target", "10 seconds, 2 minutes, or any time you can type."],
  ["02", "Hit START", "The clock vanishes the moment you do. No peeking."],
  ["03", "Hit STOP", "Stop when your gut says time is up. Closest wins."],
];

const modes = [
  { n: "A", href: "/solo", name: "Solo", tag: "You vs. your own head", text: "Choose any target and play unlimited rounds. Personal records are tracked per target, and Space replays instantly." },
  { n: "B", href: "/multiplayer", name: "Play with friends", tag: "2, 3 or 4 players", text: "Pass one device around. Everyone gets the same target, times stay sealed until the round ends, and points add up across rounds." },
  { n: "C", href: "/challenge", name: "Challenge", tag: "Random targets, 3 lives", text: "Targets get longer and stranger, and the allowed error shrinks every level. Share a link so a friend plays your exact run." },
];

const scale = [
  ["≤ 10 ms", "Perfect snap", "w-full"],
  ["≤ 50 ms", "Incredible", "w-[84%]"],
  ["≤ 150 ms", "Excellent", "w-[66%]"],
  ["≤ 400 ms", "Great", "w-[46%]"],
  ["≤ 1 s", "Close", "w-[28%]"],
];

const fair = [
  ["Monotonic clock", "Time is one subtraction on performance.now(), never a count of interval ticks, so system clock changes can't touch it."],
  ["Input-accurate", "We use the press event's own timestamp, so lag between your tap and the code running doesn't cost you."],
  ["Nothing to count on", "While the timer runs, nothing on screen moves in a loop. Your internal clock is the only clock."],
];

const targets = ["10 sec", "30 sec", "1 min", "2 min", "7.5 sec", "any time you can type"];

export default function Home() {
  return (
    <Shell wide>
      {/* Hero */}
      <section className="grid items-center gap-8 py-4 sm:grid-cols-[1.2fr_1fr] sm:py-10">
        <div className="animate-rise">
          <p className="eyebrow mb-3">A game about your internal clock</p>
          <h1 className="text-[2.6rem] font-bold leading-[.95] tracking-tight sm:text-7xl">
            Think you can <span className="relative whitespace-nowrap"><span className="relative z-10">stop time?</span><span aria-hidden className="absolute -inset-x-1 bottom-0.5 z-0 h-[38%] -rotate-1 bg-lime" /></span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink/70">Your eyes are closed. Your instincts are everything.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/solo" className="btn-primary !py-4 text-lg">Play solo</Link>
            <Link href="/multiplayer" className="btn-ghost !py-4 text-lg">Play with friends</Link>
          </div>
          <Link href="/challenge" className="mt-5 inline-block text-sm font-bold underline decoration-orange decoration-2 underline-offset-4 hover:text-orange">
            or take on Challenge mode: random targets, 3 lives →
          </Link>
        </div>
        <HeroDemo />
      </section>

      {/* Target strip */}
      <div aria-hidden className="-mx-4 my-6 overflow-hidden border-y-2 border-ink bg-lime sm:mx-0 sm:rounded-lg sm:border-2">
        <p className="flex gap-x-6 whitespace-nowrap px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-widest">
          {targets.map((t, i) => (
            <span key={t} className="flex gap-6">{t}<span className="text-orange">{i < targets.length - 1 ? "●" : ""}</span></span>
          ))}
        </p>
      </div>

      <CharacterSection />

      {/* Modes */}
      <section className="mt-12">
        <h2 className="eyebrow mb-4">Three ways to play</h2>
        <ul className="divide-y-2 divide-ink border-y-2 border-ink">
          {modes.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-3 py-5 transition-colors hover:bg-white sm:grid-cols-[3.5rem_1fr_2fr_auto] sm:items-center sm:px-2">
                <span className="font-mono text-2xl font-bold text-orange">{m.n}</span>
                <span>
                  <span className="block text-2xl font-bold tracking-tight sm:text-3xl">{m.name}</span>
                  <span className="eyebrow">{m.tag}</span>
                </span>
                <span className="col-span-2 col-start-2 row-start-2 mt-2 text-sm text-ink/70 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:mt-0">{m.text}</span>
                <span aria-hidden className="text-2xl font-bold transition-transform duration-150 group-hover:translate-x-1.5 group-hover:text-orange sm:col-start-4">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How to play */}
      <section id="how" className="mt-14 scroll-mt-20">
        <h2 className="eyebrow mb-4">How to play</h2>
        <ol className="grid gap-px overflow-hidden rounded-lg border-2 border-ink bg-ink sm:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <li key={n} className="bg-paper p-5 transition-colors hover:bg-lime/60">
              <span className="font-mono text-sm font-bold text-orange">{n}</span>
              <h3 className="mt-1 text-xl font-bold">{t}</h3>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink/60">
          Tip: <kbd className="rounded border-2 border-ink bg-white px-1.5 font-mono text-xs">Space</kbd> starts and stops, on a phone or a keyboard.
        </p>
      </section>

      {/* How good is good */}
      <section className="mt-14 grid gap-6 sm:grid-cols-[1fr_1.4fr] sm:gap-10">
        <div>
          <h2 className="eyebrow mb-2">How good is good?</h2>
          <p className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Scored by how far off you are, not how long the target is.</p>
          <p className="mt-3 text-sm text-ink/65">Every round is worth up to 1,000 points. Long targets are judged more gently than short ones, so a 2-minute snap is a fair fight.</p>
        </div>
        <ul className="space-y-2 self-center">
          {scale.map(([ms, label, w]) => (
            <li key={label} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
              <span className="num font-mono text-sm font-bold">{ms}</span>
              <span className={`${w} flex items-center rounded-sm border-2 border-ink bg-lime px-2 py-1 text-sm font-bold`}>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Fair by design */}
      <section className="mt-14">
        <h2 className="eyebrow mb-4">Fair by design</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {fair.map(([t, d]) => (
            <div key={t} className="border-t-2 border-ink pt-3">
              <h3 className="text-xl font-bold">{t}</h3>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-16 rounded-lg border-2 border-ink bg-orange p-6 text-white sm:p-10">
        <h2 className="text-4xl font-bold leading-none tracking-tight sm:text-6xl">Ready to snap?</h2>
        <p className="mt-3 max-w-md text-white/90">Takes ten seconds to learn. Takes a lifetime to get to ±10 ms.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/solo" className="btn-lime !py-4 text-lg">Play solo</Link>
          <Link href="/multiplayer" className="btn-ghost !py-4 text-lg">Play with friends</Link>
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-4 text-sm">
        <span className="flex items-center gap-2 font-bold"><LogoMark size={20} /> TimeSnap</span>
        <nav className="flex gap-5 font-bold text-ink/70">
          <Link href="/solo" className="hover:text-orange">Solo</Link>
          <Link href="/multiplayer" className="hover:text-orange">Friends</Link>
          <Link href="/challenge" className="hover:text-orange">Challenge</Link>
          <Link href="/#how" className="hover:text-orange">How to play</Link>
        </nav>
      </footer>
    </Shell>
  );
}
