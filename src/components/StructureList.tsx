import { Compass } from "lucide-react";
import type { WorldPreview } from "@/lib/seed-engine";

const StructureList = ({ world }: { world: WorldPreview }) => (
  <div className="rounded-lg border border-border bg-card p-4 pixel-border">
    <h2 className="mb-3 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wide text-primary">
      <Compass size={14} /> Nearby structures
    </h2>
    <ul className="divide-y divide-border/70">
      {world.structures.map((s) => (
        <li key={s.name} className="flex items-center justify-between py-2.5 text-sm">
          <span>{s.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {s.distance} blocks <span className="text-gold">{s.direction}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default StructureList;
