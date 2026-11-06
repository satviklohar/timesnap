"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isMuted, setMuted, unlockAudio } from "@/lib/sound";
import { LogoMark } from "./Stopwatch";
import { useName } from "./NameField";
import { CharacterPicker, Sprite, useCharacter } from "./Character";
import { Onboarding } from "./Onboarding";

const LINKS = [
  { href: "/solo", label: "Solo Play" },
  { href: "/multiplayer", label: "Play with Friends" },
  { href: "/#how", label: "How to Play" },
];

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useName();
  const [character, setCharacter] = useCharacter();
  const [muted, setM] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setM(isMuted()), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => (document.removeEventListener("pointerdown", close), document.removeEventListener("keydown", esc));
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Profile and settings"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="block rounded-md transition active:scale-90 hover:-rotate-6"
      >
        <Sprite id={character} size={40} />
      </button>
      {open && (
        <div className="panel absolute right-0 top-12 z-30 w-72 animate-pop space-y-3 p-4 shadow-[4px_4px_0_#171717]">
          <label className="block">
            <span className="eyebrow">Nickname</span>
            <input className="input mt-1" maxLength={16} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div>
            <span className="eyebrow">Character</span>
            <div className="mt-1 -ml-1.5"><CharacterPicker value={character} onChange={setCharacter} size={40} showNames={false} /></div>
          </div>
          <button
            className="flex w-full items-center justify-between text-sm font-bold"
            onClick={() => {
              unlockAudio();
              setMuted(!muted);
              setM(!muted);
            }}
          >
            Sound <span className="rounded-full border-2 border-ink px-2.5 py-0.5 text-xs">{muted ? "OFF" : "ON"}</span>
          </button>
          <nav className="space-y-1 border-t-2 border-ink/10 pt-3 sm:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="block py-1 font-bold" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

export function Shell({ title, children, wide = false }: { title?: string; children: React.ReactNode; wide?: boolean; back?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Onboarding />
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="transition-transform duration-200 group-hover:-rotate-12 group-active:scale-90"><LogoMark /></span>
            TimeSnap
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold sm:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="relative py-1 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-orange after:transition-transform hover:after:scale-x-100">
                {l.label}
              </Link>
            ))}
          </nav>
          <ProfileMenu />
        </div>
      </header>
      <main className={`mx-auto flex w-full flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 ${wide ? "max-w-5xl" : "max-w-xl"}`}>
        {title && <p className="eyebrow mb-3">{title}</p>}
        {children}
      </main>
    </div>
  );
}
