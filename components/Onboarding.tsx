"use client";
import { useEffect, useState } from "react";
import { CHARACTERS, characterById } from "@/lib/characters";
import { load, loadName, save } from "@/lib/storage";
import { sfx, unlockAudio } from "@/lib/sound";
import { Sprite, useCharacter } from "./Character";
import { LogoMark } from "./Stopwatch";
import { useName } from "./NameField";

const FLAG = "timesnap:onboarded";

/** First-visit welcome: pick a name and a character before anything else. */
export function Onboarding() {
  const [show, setShow] = useState(false);
  const [name, setName] = useName();
  const [, setCharacter] = useCharacter();
  const [draft, setDraft] = useState("");
  const [pick, setPick] = useState<string | null>(null);

  useEffect(() => {
    // Returning players who already have a name saved don't need the intro.
    const done = load<boolean>(FLAG, false) || loadName().trim() !== "";
    setShow(!done);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = prev);
  }, [show]);

  if (!show) return null;
  const ready = draft.trim().length > 0 && pick !== null;
  const picked = pick ? characterById(pick) : null;

  const finish = () => {
    if (!ready || !pick) return;
    unlockAudio();
    setName(draft.trim());
    setCharacter(pick);
    save(FLAG, true);
    sfx.good();
    setShow(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ob-title" className="fixed inset-0 z-50 overflow-y-auto bg-paper pt-[env(safe-area-inset-top)]">
      <form
        className="mx-auto flex min-h-dvh w-full max-w-xl animate-rise flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5"
        onSubmit={(e) => (e.preventDefault(), finish())}
      >
        <div className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight"><LogoMark /> TimeSnap</div>

        <p className="eyebrow">Welcome · step 1 of 1</p>
        <h1 id="ob-title" className="mt-1 text-4xl font-bold leading-none tracking-tight sm:text-5xl">Who&apos;s playing?</h1>

        <label className="mt-6 block">
          <span className="eyebrow">Your name</span>
          <input
            className="input mt-1 !py-3 text-lg"
            autoFocus
            maxLength={16}
            placeholder="e.g. Speedy"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="nickname"
          />
        </label>

        <div className="mt-6">
          <span className="eyebrow">Choose your character</span>
          <div role="radiogroup" aria-label="Choose your character" className="mt-2 grid grid-cols-5 gap-2">
            {CHARACTERS.map((c) => {
              const on = pick === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  role="radio"
                  aria-checked={on}
                  aria-label={c.name}
                  onClick={() => setPick(c.id)}
                  className={`group flex flex-col items-center gap-1 rounded-lg p-1.5 transition active:scale-90 ${on ? "bg-ink" : "hover:bg-ink/5"}`}
                >
                  <span className={`block transition-transform duration-150 ${on ? "" : "group-hover:-translate-y-1"}`}>
                    <Sprite id={c.id} size={64} mood={on ? "cheer" : "idle"} className={`!h-auto !w-full aspect-square ${on ? "!border-lime" : ""}`} />
                  </span>
                  <span className={`text-[11px] font-bold ${on ? "text-lime" : ""}`}>{c.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 min-h-10 text-sm text-ink/65" aria-live="polite">
            {picked ? <><b className="text-ink">{picked.name}.</b> {picked.tagline}</> : "Tap one. You can swap any time from your profile."}
          </p>
        </div>

        <div className="mt-auto pt-6">
          <button type="submit" className="btn-primary w-full !py-4 text-xl" disabled={!ready}>
            {ready ? `Let's snap, ${draft.trim()} →` : "Pick a name and a character"}
          </button>
        </div>
      </form>
    </div>
  );
}
