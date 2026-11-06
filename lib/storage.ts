"use client";

/** Small, defensive localStorage helpers (private mode / SSR safe). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export interface Attempt {
  targetMs: number;
  elapsedMs: number;
  diffMs: number;
  score: number;
  at: number;
}

export interface SoloStats {
  history: Attempt[]; // newest first, capped
  best: Record<string, number>; // targetMs -> best |diff|
  total: number;
}

const SOLO_KEY = "timesnap:solo:v1";
const empty: SoloStats = { history: [], best: {}, total: 0 };

export const loadSolo = () => load<SoloStats>(SOLO_KEY, empty);

export function recordSolo(a: Attempt): { stats: SoloStats; isRecord: boolean } {
  const s = loadSolo();
  const k = String(a.targetMs);
  const abs = Math.abs(a.diffMs);
  const isRecord = s.best[k] === undefined || abs < s.best[k];
  const next: SoloStats = {
    history: [a, ...s.history].slice(0, 100),
    best: isRecord ? { ...s.best, [k]: abs } : s.best,
    total: s.total + 1,
  };
  save(SOLO_KEY, next);
  return { stats: next, isRecord };
}

export function clearSolo() {
  save(SOLO_KEY, empty);
}

export const loadName = () => load<string>("timesnap:name", "");
export const saveName = (n: string) => save("timesnap:name", n);

export const loadChallengeBest = () => load<{ levels: number; score: number }>("timesnap:challenge:best", { levels: 0, score: 0 });
export const saveChallengeBest = (b: { levels: number; score: number }) => save("timesnap:challenge:best", b);

export function playerId(): string {
  let id = load<string>("timesnap:pid", "");
  if (!id) {
    id = crypto.getRandomValues(new Uint32Array(3)).reduce((s, n) => s + n.toString(36), "");
    save("timesnap:pid", id);
  }
  return id;
}
