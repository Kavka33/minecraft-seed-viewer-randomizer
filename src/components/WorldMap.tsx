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
    const dim = size * CELL;
    canvas.width = dim;
    canvas.height = dim;

    // biome tiles
    world.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = (x + y) % 2 === 0 ? cell.biome.color : cell.biome.alt;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        const shade = 0.72 + cell.height * 0.55;
        ctx.fillStyle = shade > 1 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)";
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      });
    });

    const mid = dim / 2;

    // structure pins
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    world.structures.forEach((s) => {
      const px = mid + s.pinX * (dim / 2 - 14);
      const py = mid + s.pinY * (dim / 2 - 14);
      const R = 7;

      // connection line to spawn
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(mid, mid);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // pin disc + outline
      ctx.beginPath();
      ctx.arc(px, py, R, 0, Math.PI * 2);
      ctx.fillStyle = "#111418";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e0a63c";
      ctx.stroke();

      // letter
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillText(s.icon, px, py + 0.5);
    });

    // spawn marker (drawn last so it sits on top)
    const sm = Math.floor(size / 2) * CELL;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(sm - CELL, sm - CELL, CELL * 3, CELL * 3);
    ctx.strokeStyle = "#111418";
    ctx.lineWidth = 1;
    ctx.strokeRect(sm - CELL - 2, sm - CELL - 2, CELL * 3 + 4, CELL * 3 + 4);
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
        White square = spawn · gold pins = structures (dashed line points back to spawn)
      </p>
    </div>
  );
};

export default WorldMap;
