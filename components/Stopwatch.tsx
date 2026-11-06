"use client";
import { useEffect, useState } from "react";

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="12" y="1.5" width="8" height="4" rx="1" fill="#171717" />
      <circle cx="16" cy="18" r="12" fill="#C8F169" stroke="#171717" strokeWidth="2.5" />
      <path d="M16 18 L21 11" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="18" r="1.8" fill="#171717" />
    </svg>
  );
}

const TICKS = Array.from({ length: 60 }, (_, i) => i);

/**
 * idle     – ready to go, hand at 12
 * running  – face blacked out ("eyes closed"); deliberately NOT animated so it can't be counted
 * revealed – hand sweeps to the stopped time; an orange pin marks the target
 */
export function Stopwatch({
  mode,
  elapsedMs = 0,
  targetMs = 0,
  className = "",
  onClick,
}: {
  mode: "idle" | "running" | "revealed";
  elapsedMs?: number;
  targetMs?: number;
  className?: string;
  onClick?: () => void;
}) {
  const [swept, setSwept] = useState(false);
  useEffect(() => {
    if (mode !== "revealed") return setSwept(false);
    const id = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(id);
  }, [mode]);

  const handDeg = mode === "revealed" && swept ? ((elapsedMs / 1000) % 60) * 6 : 0;
  const targetDeg = ((targetMs / 1000) % 60) * 6;
  const dark = mode === "running";

  return (
    <svg
      viewBox="0 0 200 224"
      className={`${className} ${onClick ? "cursor-pointer" : ""} select-none overflow-visible`}
      role="img"
      aria-label={dark ? "Stopwatch, timer hidden" : "Stopwatch"}
      onClick={onClick}
    >
      <rect x="86" y="4" width="28" height="20" rx="3" fill="#171717" />
      <rect x="92" y="20" width="16" height="14" fill="#171717" />
      <rect x="158" y="34" width="14" height="22" rx="3" fill="#171717" transform="rotate(40 165 45)" />
      <circle cx="100" cy="126" r="90" fill="#FF5A1F" transform="translate(5 6)" opacity=".0" />
      <circle cx="100" cy="126" r="88" fill={dark ? "#171717" : "#fff"} stroke="#171717" strokeWidth="6" style={{ transition: "fill .25s" }} />
      {TICKS.map((i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="100" y1={126 - 78} x2="100" y2={126 - (major ? 64 : 71)}
            stroke={dark ? "#C8F169" : "#171717"} strokeOpacity={dark ? (major ? 0.9 : 0.35) : major ? 1 : 0.35}
            strokeWidth={major ? 3 : 1.5} strokeLinecap="round"
            transform={`rotate(${i * 6} 100 126)`}
          />
        );
      })}

      {dark ? (
        // closed eyes
        <g stroke="#C8F169" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M60 118 Q76 134 92 118" />
          <path d="M108 118 Q124 134 140 118" />
        </g>
      ) : (
        <>
          {mode === "revealed" && targetMs > 0 && (
            <g transform={`rotate(${targetDeg} 100 126)`}>
              <circle cx="100" cy="42" r="7" fill="#C8F169" stroke="#171717" strokeWidth="3" />
            </g>
          )}
          <g style={{ transformOrigin: "100px 126px", transform: `rotate(${handDeg}deg)`, transition: swept ? "transform 1s cubic-bezier(.2,.9,.2,1)" : "none" }}>
            <line x1="100" y1="132" x2="100" y2="52" stroke="#FF5A1F" strokeWidth="6" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="126" r="8" fill="#171717" />
        </>
      )}
    </svg>
  );
}
