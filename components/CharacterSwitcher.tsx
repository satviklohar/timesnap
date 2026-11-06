"use client";
import { useEffect, useState } from "react";
import { CHARACTERS, characterById } from "@/lib/characters";
import { Sprite, useCharacter } from "./Character";

/** "Playing as X · Change" button that opens a full character picker. */
export function CharacterSwitcher({ className = "" }: { className?: string }) {
  const [id, setId] = useCharacter();
  const [open, setOpen] = useState(false);
  const c = characterById(id);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      e.stopPropagation();
    };
    window.addEventListener("keydown", esc, true);
    return () => window.removeEventListener("keydown", esc, true);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={`group flex items-center gap-3 rounded-lg border-2 border-ink bg-white py-1.5 pl-1.5 pr-3 text-left transition duration-100 hover:bg-lime active:scale-[.98] ${className}`}
      >
        <Sprite id={id} size={40} />
        <span className="leading-tight">
          <span className="eyebrow block">Playing as</span>
          <span className="font-bold">{c.name}</span>
        </span>
        <span className="ml-auto pl-4 text-sm font-bold underline decoration-orange decoration-2 underline-offset-4">Change</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-4 animate-[fade_.15s_ease-out] sm:place-items-center" onPointerDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose your character"
            className="w-full max-w-md animate-pop rounded-lg border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_#171717]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Choose your character</h2>
              <button className="text-sm font-bold underline" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div role="radiogroup" aria-label="Characters" className="mt-4 grid grid-cols-5 gap-2">
              {CHARACTERS.map((ch) => {
                const on = ch.id === id;
                return (
                  <button
                    key={ch.id}
                    role="radio"
                    aria-checked={on}
                    aria-label={ch.name}
                    onClick={() => {
                      setId(ch.id);
                      setOpen(false);
                    }}
                    className={`group flex flex-col items-center gap-1 rounded-lg p-1.5 transition active:scale-90 ${on ? "bg-ink" : "hover:bg-ink/5"}`}
                  >
                    <Sprite id={ch.id} size={64} className={`!h-auto !w-full aspect-square ${on ? "!border-lime" : ""}`} />
                    <span className={`text-[11px] font-bold ${on ? "text-lime" : ""}`}>{ch.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-ink/65">{c.tagline}</p>
          </div>
        </div>
      )}
    </>
  );
}
