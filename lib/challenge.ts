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
