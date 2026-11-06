/** 12345 -> "12.345" (seconds, 3 decimals) */
export function fmtSeconds(ms: number, decimals = 2): string {
  return (ms / 1000).toFixed(decimals);
}

/** Target label: 60000 -> "1 min", 90000 -> "1 min 30 s", 10500 -> "10.5 s" */
export function fmtTarget(ms: number): string {
  const totalSec = ms / 1000;
  if (totalSec < 60) return `${trim(totalSec)} s`;
  const m = Math.floor(totalSec / 60);
  const s = +(totalSec - m * 60).toFixed(3);
  return s === 0 ? `${m} min` : `${m} min ${trim(s)} s`;
}

function trim(n: number): string {
  return String(+n.toFixed(3));
}

/** Signed difference with unit, e.g. "+182 ms" (late) / "-45 ms" (early). */
export function fmtDiff(diffMs: number): string {
  const r = Math.round(diffMs);
  return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${Math.abs(r).toLocaleString()} ms`;
}

export function fmtAbs(diffMs: number): string {
  return `${Math.round(Math.abs(diffMs)).toLocaleString()} ms`;
}

/** Parse "m:ss", "mm:ss.xx", or plain seconds ("12.5"). Returns ms or null. */
export function parseTarget(input: string): number | null {
  const s = input.trim().replace(",", ".");
  if (!s) return null;
  let sec: number;
  if (s.includes(":")) {
    const [m, rest] = s.split(":");
    if (!/^\d+$/.test(m) || !/^\d+(\.\d+)?$/.test(rest ?? "")) return null;
    sec = Number(m) * 60 + Number(rest);
  } else {
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    sec = Number(s);
  }
  const ms = Math.round(sec * 1000);
  return ms >= 1000 && ms <= 60 * 60 * 1000 ? ms : null;
}

/** 60000 -> "01:00.00" (mm:ss.cc) */
export function fmtClock(ms: number): string {
  const cs = Math.round(ms / 10);
  const m = Math.floor(cs / 6000);
  const s = Math.floor((cs % 6000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
}

/** "0.24 seconds too early" / "Dead on" */
export function fmtDiffWords(diffMs: number): string {
  const abs = Math.abs(diffMs);
  if (abs < 5) return "Dead on. Basically a clock.";
  const val = abs < 1000 ? (abs / 1000).toFixed(2) : (abs / 1000).toFixed(abs < 10000 ? 2 : 1);
  return `${val} seconds too ${diffMs < 0 ? "early" : "late"}`;
}
