"use client";
import { useMemo } from "react";

const COLORS = ["#FF5A1F", "#C8F169", "#171717", "#FF5A1F", "#C8F169"];

export function Confetti({ count = 50 }: { count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        round: i % 4 === 0,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti border border-ink/60"
          style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, width: b.size, height: b.size * (b.round ? 1 : 1.7), borderRadius: b.round ? 9999 : 2, background: b.color }}
        />
      ))}
    </div>
  );
}
