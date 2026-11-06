import { Sprite } from "./Character";

export function Avatar({ hue, name, size = 36, ready, character }: { hue: number; name: string; size?: number; ready?: boolean; character?: string }) {
  return (
    <span className="relative inline-block shrink-0">
      {character ? (
        <Sprite id={character} size={size} />
      ) : (
        <span className="inline-grid place-items-center rounded-md border-2 border-ink font-bold text-ink" style={{ width: size, height: size, background: `hsl(${hue} 85% 72%)`, fontSize: size * 0.45 }}>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      {ready && <span className="absolute -bottom-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-ink bg-lime text-[9px] leading-none">✓</span>}
    </span>
  );
}
