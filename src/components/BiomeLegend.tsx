import type { WorldPreview } from "@/lib/seed-engine";

const BiomeLegend = ({ world }: { world: WorldPreview }) => (
  <div className="rounded-lg border border-border bg-card p-4 pixel-border">
    <h2 className="mb-3 font-pixel text-[10px] uppercase tracking-wide text-primary">Biome mix</h2>
    <ul className="space-y-2.5">
      {world.biomeCounts.map(({ biome, pct }) => (
        <li key={biome.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: biome.color }} />
              {biome.name}
            </span>
            <span className="font-mono text-muted-foreground">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: biome.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default BiomeLegend;
