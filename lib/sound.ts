"use client";
import { load, save } from "./storage";

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

export function isMuted(): boolean {
  if (muted === null) muted = load<boolean>("timesnap:muted", false);
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  save("timesnap:muted", m);
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18, slideTo?: number) {
  const c = ac();
  if (!c || isMuted()) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Call from a user gesture once to unlock audio on iOS. */
export const unlockAudio = () => void ac();

export const sfx = {
  start: () => {
    tone(440, 0, 0.1, "triangle");
    tone(660, 0.08, 0.14, "triangle");
  },
  stop: () => tone(180, 0, 0.12, "square", 0.12, 90),
  tick: () => tone(900, 0, 0.04, "square", 0.06),
  join: () => tone(740, 0, 0.1, "sine", 0.12),
  miss: () => tone(220, 0, 0.35, "sawtooth", 0.1, 110),
  good: () => {
    tone(523, 0, 0.12, "triangle");
    tone(659, 0.1, 0.12, "triangle");
    tone(784, 0.2, 0.2, "triangle");
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, "triangle", 0.2));
    tone(1319, 0.45, 0.5, "sine", 0.15);
  },
};
