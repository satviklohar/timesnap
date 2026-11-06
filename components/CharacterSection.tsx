"use client";
import { CHARACTERS, characterById } from "@/lib/characters";
import { Sprite, useCharacter } from "./Character";

export function CharacterSection() {
  const [id, setId] = useCharacter();
  const picked = characterById(id);
  return (
    <section className="mt-14">
      <h2 className="eyebrow mb-4">Pick your character</h2>
      <div className="grid items-center gap-6 sm:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Who&apos;s keeping time for you?</p>
          <p className="mt-3 text-sm text-ink/65">Your character shows up in your profile, on every result screen, and as your avatar when you play with friends. They cheer when you nail it.</p>
        </div>
        <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border-2 border-ink bg-ink">
          {CHARACTERS.map((c) => {
            const on = c.id === id;
            return (
              <li key={c.id} className="bg-paper">
                <button
                  onClick={() => setId(c.id)}
                  aria-pressed={on}
                  className={`group flex h-full w-full flex-col items-center gap-2 p-3 transition-colors ${on ? "bg-lime" : "hover:bg-white"}`}
                >
                  <span className="transition-transform duration-150 group-hover:-translate-y-1 group-active:scale-90">
                    <Sprite id={c.id} size={80} mood={on ? "cheer" : "idle"} />
                  </span>
                  <span className="font-bold">{c.name}</span>
                  <span className="hidden">{c.tagline}</span>
                </button>
              </li>
            );
          })}
          {Array.from({ length: (3 - (CHARACTERS.length % 3)) % 3 }, (_, i) => (
            <li key={`f${i}`} aria-hidden className="bg-paper" />
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs font-bold text-ink/50">Playing as {picked.name}</p>
    </section>
  );
}
