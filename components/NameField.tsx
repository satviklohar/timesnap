"use client";
import { useEffect, useState } from "react";
import { loadName, saveName } from "@/lib/storage";

export function useName() {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(loadName());
    const sync = () => setName(loadName());
    window.addEventListener("timesnap:name", sync);
    return () => window.removeEventListener("timesnap:name", sync);
  }, []);
  return [
    name,
    (n: string) => {
      setName(n);
      saveName(n);
      window.dispatchEvent(new Event("timesnap:name"));
    },
  ] as const;
}

export function NameField({ name, onChange }: { name: string; onChange: (n: string) => void }) {
  return (
    <label className="block">
      <span className="eyebrow">Your nickname</span>
      <input className="input mt-1" maxLength={16} placeholder="e.g. Speedy" value={name} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
