import { Compass } from "lucide-react";
import type { WorldPreview } from "@/lib/seed-engine";

const ICON: Record<string, string> = {
  Village: "🏘",
  "Pillager Outpost": "⚔",
  "Desert Temple": "🗿",
  "Jungle Temple": "🗿",
  "Woodland Mansion": "🏰",
  "Ruined Portal": "🌀",
  Shipwreck: "🚢",
  "Ocean Monument": "🔱",
  "Ancient City": "🕳",
  Stronghold: "👁",
  "Witch Hut": "🧹",
  Igloo: "❄",
  "Buried Treasure": "💎",
  "Trail Ruins": "🏺",
};

const StructureList = ({ world }: { world: WorldPreview }) => (
  <div className="rounded-lg border border-border bg-card p-4 pixel-border">
    <h2 className="mb-3 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wide text-primary">
      <Compass size={14} /> Nearby structures
    </h2>
    <ul className="divide-y divide-border/70">
      {world.structures.map((s) => (
        <li key={s.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden>{ICON[s.name] ?? "📍"}</span>
            <span className="truncate">{s.name}</span>
          </span>
          <span className="shrink-0 text-right font-mono text-xs">
            <span className="text-foreground">
              {s.x}, {s.z}
            </span>
            <span className="ml-2 text-muted-foreground">
              {s.distance} bl <span className="text-gold">{s.direction}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
      Format: X, Z · distance from spawn (0, 0)
    </p>
  </div>
);

export default StructureList;
