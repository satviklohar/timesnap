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

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** localStorage can be edited by anyone with the device, so re-validate its shape. */
export function loadSolo(): SoloStats {
  const raw = load<Partial<SoloStats>>(SOLO_KEY, empty);
  const history = Array.isArray(raw.history)
    ? raw.history.slice(0, 100).map((a) => ({ targetMs: num(a?.targetMs), elapsedMs: num(a?.elapsedMs), diffMs: num(a?.diffMs), score: num(a?.score), at: num(a?.at) }))
    : [];
  const best: Record<string, number> = {};
  if (raw.best && typeof raw.best === "object") for (const [k, v] of Object.entries(raw.best)) if (/^\d+$/.test(k)) best[k] = num(v);
  return { history, best, total: num(raw.total) };
}

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

export const loadName = () => {
  const n = load<unknown>("timesnap:name", "");
  return typeof n === "string" ? n.slice(0, 16) : "";
};
export const saveName = (n: string) => save("timesnap:name", n);

export const loadChallengeBest = () => load<{ levels: number; score: number }>("timesnap:challenge:best", { levels: 0, score: 0 });
export const saveChallengeBest = (b: { levels: number; score: number }) => save("timesnap:challenge:best", b);
