"use client";
import { useState } from "react";
import { fmtTarget, parseTarget } from "@/lib/format";

export const PRESETS = [10_000, 30_000, 60_000, 120_000];

export function TargetPicker({ value, onChange }: { value: number; onChange: (ms: number) => void }) {
  const isPreset = PRESETS.includes(value);
  const [custom, setCustom] = useState(isPreset ? "" : String(value / 1000));
  const [error, setError] = useState(false);

  const commit = (text: string) => {
    setCustom(text);
    const ms = parseTarget(text);
    setError(text.trim() !== "" && ms === null);
    if (ms !== null) onChange(ms);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Target time">
        {PRESETS.map((p) => (
          <button
            key={p}
            className={`chip ${value === p && custom === "" ? "chip-on" : ""}`}
            onClick={() => {
              setCustom("");
              setError(false);
              onChange(p);
            }}
          >
            {fmtTarget(p)}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="eyebrow">Custom: seconds or m:ss (7.5, 1:45)</span>
        <input
          className={`input num mt-1 ${error ? "!border-red-600" : ""}`}
          inputMode="decimal"
          placeholder="Any duration, 1 s to 60 min"
          value={custom}
          onChange={(e) => commit(e.target.value)}
          aria-invalid={error}
        />
      </label>
      {error && <p className="mt-1 text-sm font-bold text-red-600">Enter a time between 1 second and 60 minutes.</p>}
    </div>
  );
}
