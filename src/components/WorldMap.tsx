import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Minus, Plus } from "lucide-react";
import { BLOCKS_PER_CELL, sampleCell, type WorldPreview } from "@/lib/seed-engine";

type Props = { world: WorldPreview };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 1000;
const VIEW = 640; // CSS px square viewport

const WorldMap = ({ world }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // camera centered on world coords (blocks): cx = X, cy = Z
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const drag = useRef({ active: false, sx: 0, sy: 0, bx: 0, by: 0 });

  // world block → view px
  const toPx = useCallback(
    (wx: number, wz: number) => {
      const cell = BLOCKS_PER_CELL * zoom;
      return {
        x: VIEW / 2 + (wx - center.x) * (cell / BLOCKS_PER_CELL),
        y: VIEW / 2 + (wz - center.y) * (cell / BLOCKS_PER_CELL),
      };
    },
    [zoom, center]
  );

  // view px → world block
  const toWorld = useCallback(
    (px: number, py: number) => {
      const cell = BLOCKS_PER_CELL * zoom;
      return {
        x: center.x + (px - VIEW / 2) * (BLOCKS_PER_CELL / cell),
        y: center.y + (py - VIEW / 2) * (BLOCKS_PER_CELL / cell),
      };
    },
    [zoom, center]
  );

  const recenter = useCallback(() => {
    setCenter({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIEW * dpr;
    canvas.height = VIEW * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const cell = BLOCKS_PER_CELL * zoom; // px per cell
    const topLeft = toWorld(0, 0);
    const cols = Math.ceil(VIEW / cell) + 2;
    const rows = Math.ceil(VIEW / cell) + 2;
    const startCol = Math.floor(topLeft.x / BLOCKS_PER_CELL);
    const startRow = Math.floor(topLeft.y / BLOCKS_PER_CELL);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = (startCol + c) * BLOCKS_PER_CELL;
        const wz = (startRow + r) * BLOCKS_PER_CELL;
        const data = sampleCell(world.seedNumber, wx, wz);
        const p = toPx(wx, wz);
        ctx.fillStyle = (startCol + c + startRow + r) % 2 === 0 ? data.biome.color : data.biome.alt;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(cell) + 1, Math.ceil(cell) + 1);
        const shade = 0.72 + data.height * 0.55;
        ctx.fillStyle = shade > 1 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)";
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(cell) + 1, Math.ceil(cell) + 1);
      }
    }

    // structure pins
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const R = Math.max(6, 7 * Math.sqrt(zoom));
    world.structures.forEach((s) => {
      const p = toPx(s.x, s.z);
      const sp = toPx(0, 0);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fillStyle = "#111418";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e0a63c";
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = `bold ${Math.max(9, 9 * Math.sqrt(zoom))}px 'JetBrains Mono', monospace`;
      ctx.fillText(s.icon, p.x, p.y + 0.5);
    });

    // spawn marker
    const sp = toPx(0, 0);
    const sz = Math.max(18, 24 * zoom);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(sp.x - sz / 2, sp.y - sz / 2, sz, sz);
    ctx.strokeStyle = "#111418";
    ctx.lineWidth = 1;
    ctx.strokeRect(sp.x - sz / 2 - 2, sp.y - sz / 2 - 2, sz + 4, sz + 4);
  }, [world, zoom, center, toPx, toWorld]);

  // wheel zoom around cursor
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const before = toWorld(px, py);
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      setZoom((z) => {
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
        // keep cursor anchored
        const cellAfter = BLOCKS_PER_CELL * nz;
        const nx = before.x - (px - VIEW / 2) * (BLOCKS_PER_CELL / cellAfter);
        const ny = before.y - (py - VIEW / 2) * (BLOCKS_PER_CELL / cellAfter);
        setCenter({ x: nx, y: ny });
        return nz;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toWorld]);

  // drag pan
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, bx: center.x, by: center.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const cell = BLOCKS_PER_CELL * zoom;
    setCenter({
      x: drag.current.bx - (e.clientX - drag.current.sx) * (BLOCKS_PER_CELL / cell),
      y: drag.current.by - (e.clientY - drag.current.sy) * (BLOCKS_PER_CELL / cell),
    });
  };
  const onPointerUp = () => {
    drag.current.active = false;
  };

  const stepZoom = (dir: number) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (dir > 0 ? 1.25 : 1 / 1.25))));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 pixel-border">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-pixel text-[10px] uppercase tracking-wide text-primary">Full world map</h2>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            X {Math.round(center.x)} · Z {Math.round(center.y)}
          </span>
          <div className="flex overflow-hidden rounded border border-border">
            <button onClick={() => stepZoom(-1)} className="bg-secondary px-2 py-1 transition hover:bg-secondary/70" title="Zoom out">
              <Minus size={14} />
            </button>
            <span className="bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">{zoom.toFixed(2)}×</span>
            <button onClick={() => stepZoom(1)} className="bg-secondary px-2 py-1 transition hover:bg-secondary/70" title="Zoom in">
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={recenter}
            className="rounded border border-border bg-secondary px-2 py-1 text-secondary-foreground transition hover:border-primary/60"
            title="Recenter on spawn"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>
      <div
        ref={wrapRef}
        className="relative mx-auto overflow-hidden rounded border border-border/80"
        style={{ width: VIEW, height: VIEW, maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="pixelated block cursor-grab touch-none active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW, maxWidth: "100%", imageRendering: "pixelated" }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Drag to pan anywhere in the world · scroll or buttons to zoom · white square = spawn · gold pins = structures
      </p>
    </div>
  );
};

export default WorldMap;
