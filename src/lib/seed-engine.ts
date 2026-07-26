// Deterministic pseudo-world generation from a Minecraft-style seed string.

export type Biome = {
  key: string;
  name: string;
  color: string;
  alt: string;
};

export const BIOMES: Biome[] = [
  { key: "plains", name: "Plains", color: "#7cb342", alt: "#8bc34a" },
  { key: "forest", name: "Forest", color: "#3f6f2a", alt: "#4c8434" },
  { key: "jungle", name: "Jungle", color: "#2f7d32", alt: "#3d9440" },
  { key: "taiga", name: "Taiga", color: "#3c6b5a", alt: "#4a7f6b" },
  { key: "savanna", name: "Savanna", color: "#b3a047", alt: "#c4b055" },
  { key: "desert", name: "Desert", color: "#dccb7a", alt: "#e6d78f" },
  { key: "badlands", name: "Badlands", color: "#c1682f", alt: "#d2793c" },
  { key: "snowy", name: "Snowy Tundra", color: "#dfe9ef", alt: "#eef4f7" },
  { key: "mountains", name: "Windswept Hills", color: "#8a8f96", alt: "#9ba0a7" },
  { key: "swamp", name: "Swamp", color: "#4d6b3f", alt: "#5c7c4b" },
  { key: "mushroom", name: "Mushroom Fields", color: "#9a83b8", alt: "#ab94c7" },
  { key: "ocean", name: "Ocean", color: "#1f4f8b", alt: "#2a5fa1" },
  { key: "beach", name: "Beach", color: "#e5dba6", alt: "#efe6b8" },
];

export const STRUCTURES = [
  "Village",
  "Pillager Outpost",
  "Desert Temple",
  "Jungle Temple",
  "Woodland Mansion",
  "Ruined Portal",
  "Shipwreck",
  "Ocean Monument",
  "Ancient City",
  "Stronghold",
  "Witch Hut",
  "Igloo",
  "Buried Treasure",
  "Trail Ruins",
];

/** Convert any seed text to a 32-bit numeric seed (Java-ish behaviour). */
export function seedToNumber(seed: string): number {
  const trimmed = seed.trim();
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n | 0;
  }
  let h = 0;
  for (let i = 0; i < trimmed.length; i++) {
    h = (Math.imul(31, h) + trimmed.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(a: number) {
  let t = a >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number, s: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, s: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const a = hash2(x0, y0, s);
  const b = hash2(x0 + 1, y0, s);
  const c = hash2(x0, y0 + 1, s);
  const d = hash2(x0 + 1, y0 + 1, s);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

function fbm(x: number, y: number, s: number, octaves = 4) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(x * freq, y * freq, s + o * 7919) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

export type MapCell = { biome: Biome; height: number };

/** blocks represented by one map cell (zoom granularity) */
export const BLOCKS_PER_CELL = 8;

/** Sample the world at a single world X/Z (in blocks). Deterministic per seed. */
export function sampleCell(seed: number, worldX: number, worldZ: number): MapCell {
  const s = seed;
  const nx = worldX / 60;
  const ny = worldZ / 60;
  const h = fbm(nx, ny, s, 4);
  const temp = fbm(nx * 0.5 + 40, ny * 0.5 - 17, s ^ 12345, 3);
  const moist = fbm(nx * 0.6 - 25, ny * 0.6 + 9, s ^ 98765, 3);
  const rare = (s & 0xffff) / 0xffff < 0.06;
  let biome = pickBiome(h, temp, moist);
  if (rare && h > 0.4 && h < 0.55 && moist > 0.6 && temp > 0.45 && temp < 0.6) {
    biome = BIOMES.find((b) => b.key === "mushroom")!;
  }
  return { biome, height: h };
}

export type WorldPreview = {
  seedNumber: number;
  size: number;
  spawnBiome: Biome;
  biomeCounts: { biome: Biome; pct: number }[];
  structures: { name: string; distance: number; direction: string; icon: string; x: number; z: number }[];
  stats: { label: string; value: string }[];
};

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const STRUCTURE_ICONS: Record<string, string> = {
  Village: "V",
  "Pillager Outpost": "P",
  "Desert Temple": "T",
  "Jungle Temple": "T",
  "Woodland Mansion": "M",
  "Ruined Portal": "R",
  Shipwreck: "S",
  "Ocean Monument": "O",
  "Ancient City": "A",
  Stronghold: "E",
  "Witch Hut": "W",
  Igloo: "I",
  "Buried Treasure": "$",
  "Trail Ruins": "U",
};

function pickBiome(h: number, temp: number, moist: number): Biome {
  const get = (k: string) => BIOMES.find((b) => b.key === k)!;
  if (h < 0.34) return get("ocean");
  if (h < 0.38) return get("beach");
  if (h > 0.76) return get(temp < 0.35 ? "snowy" : "mountains");
  if (temp < 0.3) return get(moist > 0.5 ? "taiga" : "snowy");
  if (temp > 0.72) {
    if (moist < 0.3) return get("desert");
    if (moist < 0.55) return get("badlands");
    return get("jungle");
  }
  if (moist < 0.32) return get("savanna");
  if (moist > 0.72) return get(h < 0.45 ? "swamp" : "forest");
  return get(h < 0.5 ? "plains" : "forest");
}

export function generateWorld(seed: string, size = 48): WorldPreview {
  const s = seedToNumber(seed);
  const rand = mulberry32(s ^ 0x9e3779b9);

  // sample the spawn region for stats / biome mix
  const counts = new Map<string, number>();
  let spawnHeight = 0;
  let waterCells = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wx = (x - size / 2) * BLOCKS_PER_CELL;
      const wz = (y - size / 2) * BLOCKS_PER_CELL;
      const cell = sampleCell(s, wx, wz);
      if (x === Math.floor(size / 2) && y === Math.floor(size / 2)) {
        spawnHeight = cell.height;
      }
      counts.set(cell.biome.key, (counts.get(cell.biome.key) ?? 0) + 1);
      if (cell.biome.key === "ocean") waterCells++;
    }
  }

  const spawnCell = sampleCell(s, 0, 0);
  const spawnBiome = spawnCell.biome;
  const total = size * size;
  const rare = (s & 0xffff) / 0xffff < 0.06;
  const biomeCounts = [...counts.entries()]
    .map(([key, n]) => ({ biome: BIOMES.find((b) => b.key === key)!, pct: (n / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  const shuffled = [...STRUCTURES].sort(() => rand() - 0.5);
  const structures = shuffled.slice(0, 6).map((name) => {
    const distance = Math.round(80 + rand() * 2400);
    const dirIdx = Math.floor(rand() * DIRS.length);
    const dir = DIRS[dirIdx];
    // world coords: N = -Z, E = +X. angle measured from N clockwise.
    const x = Math.round(Math.sin(dirIdx * 45 * (Math.PI / 180)) * distance);
    const z = -Math.round(Math.cos(dirIdx * 45 * (Math.PI / 180)) * distance);
    return {
      name,
      distance,
      direction: dir,
      icon: STRUCTURE_ICONS[name] ?? "·",
      x,
      z,
    };
  }).sort((a, b) => a.distance - b.distance);

  const seaLevel = 62 + Math.round(rand() * 2);
  const stats = [
    { label: "Spawn biome", value: spawnBiome.name },
    { label: "Spawn point", value: `${Math.round((rand() - 0.5) * 240)}, ${seaLevel + Math.round(rand() * 12)}, ${Math.round((rand() - 0.5) * 240)}` },
    { label: "Terrain", value: spawnHeight > 0.6 ? "Hilly" : spawnHeight < 0.4 ? "Coastal / low" : "Rolling" },
    { label: "Water coverage", value: `${Math.round((waterCells / total) * 100)}%` },
    { label: "Stronghold ring", value: `${1280 + Math.round(rand() * 1400)} blocks` },
    { label: "Rarity", value: rare ? "Rare — Mushroom Fields!" : biomeCounts[0].pct > 45 ? "Uniform world" : "Balanced" },
  ];

  return { seedNumber: s, size, spawnBiome, biomeCounts, structures, stats };
}

export function randomSeed(): string {
  const hi = Math.floor(Math.random() * 0xffffffff) - 0x7fffffff;
  return String(hi);
}
