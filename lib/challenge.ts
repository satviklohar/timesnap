import { seededRng } from "./rng";

export const MAX_LIVES = 3;

/** Difficulty ramps: longer, less "round" targets and a shrinking pass window. */
export function challengeTarget(seed: string, level: number): number {
  const r = seededRng(`${seed}:${level}`);
  const tier = Math.min(3, Math.floor((level - 1) / 3));
  const [lo, hi, step] = [
    [3, 8, 1000],
    [6, 20, 500],
    [10, 40, 100],
    [15, 90, 10],
  ][tier];
  const raw = lo * 1000 + r() * (hi - lo) * 1000;
  return Math.round(raw / step) * step;
}

/** Max allowed |error| (ms) to clear a level. */
export function challengeTolerance(level: number): number {
  return Math.max(60, Math.round(900 * Math.pow(0.86, level - 1)));
}

export function newSeed(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Share-link params come from the URL, so treat them as untrusted. */
export const cleanSeed = (v: string | null): string | null => (v && /^[A-Za-z0-9]{1,12}$/.test(v) ? v.toUpperCase() : null);

export const cleanInt = (v: string | null, max = 10_000_000): number => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
};

// eslint-disable-next-line no-control-regex
export const cleanName = (v: string | null, fallback = "A friend"): string => v?.replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 16) || fallback;
