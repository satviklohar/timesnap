export interface Character {
  id: string;
  name: string;
  tagline: string;
  src: string;
  bg: string; // tile colour that makes the sprite pop
}

/** To add a character: drop a 32×32 PNG in /public/characters and add a row here. */
export const CHARACTERS: Character[] = [
  { id: "kitsune", name: "Kitsune", tagline: "Calm. Cunning. Always on the beat.", src: "/characters/kitsune.png", bg: "#FF8A5C" },
  { id: "oni", name: "Oni", tagline: "Eyes shut, horns up, zero doubt.", src: "/characters/oni.png", bg: "#C8F169" },
  { id: "orbit", name: "Orbit", tagline: "Has seen a lot of time out there.", src: "/characters/orbit.png", bg: "#FFE08A" },
  { id: "panda", name: "Panda", tagline: "Chill, round, suspiciously accurate.", src: "/characters/panda.png", bg: "#A8DCFF" },
  { id: "phantom", name: "Phantom", tagline: "Moves in the gaps between seconds.", src: "/characters/phantom.png", bg: "#C9A7FF" },
  { id: "blaze", name: "Blaze", tagline: "Runs hot. Stops on a dime.", src: "/characters/blaze.png", bg: "#FFE08A" },
  { id: "prism", name: "Prism", tagline: "Sees time in every colour.", src: "/characters/prism.png", bg: "#FFB3D9" },
  { id: "beats", name: "Beats", tagline: "Finds the rhythm, then rides it.", src: "/characters/beats.png", bg: "#C8F169" },
  { id: "kraken", name: "Kraken", tagline: "Eight arms, all counting.", src: "/characters/kraken.png", bg: "#8FD3FF" },
];

export const DEFAULT_CHARACTER = CHARACTERS[0].id;
export const characterById = (id?: string | null) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
