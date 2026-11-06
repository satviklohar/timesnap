export interface Rating {
  label: string;
  emoji: string;
  tone: "gold" | "green" | "cyan" | "amber" | "rose";
}

/** Accuracy points, 0–1000. Scales with target so long targets are judged fairly. */
export function scoreFor(diffMs: number, targetMs: number): number {
  const scale = Math.max(300, targetMs * 0.04);
  return Math.round(1000 * Math.exp(-Math.abs(diffMs) / scale));
}

export function ratingFor(absDiffMs: number): Rating {
  if (absDiffMs <= 10) return { label: "PERFECT SNAP", emoji: "🎯", tone: "gold" };
  if (absDiffMs <= 50) return { label: "Incredible", emoji: "🤯", tone: "gold" };
  if (absDiffMs <= 150) return { label: "Excellent", emoji: "🔥", tone: "green" };
  if (absDiffMs <= 400) return { label: "Great", emoji: "😎", tone: "cyan" };
  if (absDiffMs <= 1000) return { label: "Close", emoji: "👍", tone: "amber" };
  return { label: "Keep trying", emoji: "🌀", tone: "rose" };
}

export const isCelebration = (absDiffMs: number) => absDiffMs <= 150;
