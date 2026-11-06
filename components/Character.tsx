"use client";
import { useEffect, useState } from "react";
import { CHARACTERS, DEFAULT_CHARACTER, characterById } from "@/lib/characters";
import { load, save } from "@/lib/storage";

const KEY = "timesnap:character";

/** The player's chosen character, persisted and synced across components. */
export function useCharacter() {
  const [id, setId] = useState(DEFAULT_CHARACTER);
  useEffect(() => {
    setId(load<string>(KEY, DEFAULT_CHARACTER));
    const sync = () => setId(load<string>(KEY, DEFAULT_CHARACTER));
    window.addEventListener("timesnap:character", sync);
    return () => window.removeEventListener("timesnap:character", sync);
  }, []);
  return [
    id,
    (next: string) => {
      setId(next);
      save(KEY, next);
      window.dispatchEvent(new Event("timesnap:character"));
    },
  ] as const;
}

export type Mood = "idle" | "cheer" | "oops";

/** Pixel-art sprite, drawn crisp at any size. */
export function Sprite({ id, size = 64, mood = "idle", framed = true, className = "" }: { id: string; size?: number; mood?: Mood; framed?: boolean; className?: string }) {
  const c = characterById(id);
  const anim = mood === "cheer" ? "animate-[hop_.6s_ease-out_2]" : mood === "oops" ? "animate-shake" : "";
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden ${framed ? "rounded-md border-2 border-ink" : ""} ${anim} ${className}`}
      style={{ width: size, height: size, background: framed ? c.bg : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.src} alt={c.name} width={size} height={size} draggable={false} style={{ imageRendering: "pixelated", width: "100%", height: "100%", filter: mood === "oops" ? "saturate(.6)" : undefined }} />
    </span>
  );
}

export function CharacterPicker({ value, onChange, size = 72, showNames = true }: { value: string; onChange: (id: string) => void; size?: number; showNames?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Choose your character" className="flex flex-wrap gap-2">
      {CHARACTERS.map((c) => {
        const on = c.id === value;
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={on}
            aria-label={c.name}
            onClick={() => onChange(c.id)}
            className={`group flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition active:scale-95 ${on ? "bg-ink" : "hover:bg-ink/5"}`}
          >
            <span className={`transition-transform duration-150 ${on ? "" : "group-hover:-translate-y-1"}`}>
              <Sprite id={c.id} size={size} framed className={on ? "!border-lime" : ""} />
            </span>
            {showNames && <span className={`text-xs font-bold ${on ? "text-lime" : ""}`}>{c.name}</span>}
          </button>
        );
      })}
    </div>
  );
}
