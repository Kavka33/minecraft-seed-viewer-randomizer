import { useEffect, useRef } from "react";
import type { WorldPreview } from "@/lib/seed-engine";

type Props = { world: WorldPreview };

const CELL = 10;

const WorldMap = ({ world }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = world.grid.length;
    canvas.width = size * CELL;
    canvas.height = size * CELL;

    world.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const shade = 0.72 + cell.height * 0.55;
        ctx.fillStyle = (x + y) % 2 === 0 ? cell.biome.color : cell.biome.alt;
        ctx.globalAlpha = 1;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        ctx.fillStyle = shade > 1 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)";
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      });
    });

    // spawn marker
    const mid = Math.floor(size / 2) * CELL;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(mid - CELL, mid - CELL, CELL * 3, CELL * 3);
    ctx.strokeStyle = "#111418";
    ctx.lineWidth = 1;
    ctx.strokeRect(mid - CELL - 2, mid - CELL - 2, CELL * 3 + 4, CELL * 3 + 4);
  }, [world]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 pixel-border">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-pixel text-[10px] uppercase tracking-wide text-primary">Spawn area map</h2>
        <span className="text-xs text-muted-foreground">~1500 × 1500 blocks</span>
      </div>
      <canvas
        ref={canvasRef}
        className="pixelated w-full rounded border border-border/80 animate-pop-in"
        style={{ imageRendering: "pixelated" }}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        White square marks world spawn · colors show biome, brightness shows elevation
      </p>
    </div>
  );
};

export default WorldMap;
