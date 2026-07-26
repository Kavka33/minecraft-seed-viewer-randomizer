import type { WorldPreview } from "@/lib/seed-engine";

const WorldStats = ({ world }: { world: WorldPreview }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
    {world.stats.map((s) => (
      <div key={s.label} className="rounded-lg border border-border bg-card p-3 pixel-border">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
        <p className="mt-1 font-mono text-sm font-bold text-foreground">{s.value}</p>
      </div>
    ))}
  </div>
);

export default WorldStats;
