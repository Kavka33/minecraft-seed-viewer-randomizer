import { Star, Trash2 } from "lucide-react";

type Props = {
  seeds: string[];
  onSelect: (seed: string) => void;
  onRemove: (seed: string) => void;
};

const SavedSeeds = ({ seeds, onSelect, onRemove }: Props) => (
  <div className="rounded-lg border border-border bg-card p-4 pixel-border">
    <h2 className="mb-3 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wide text-accent">
      <Star size={14} /> Saved seeds
    </h2>
    {seeds.length === 0 ? (
      <p className="text-xs text-muted-foreground">
        Nothing saved yet — hit the star button to keep a seed for later.
      </p>
    ) : (
      <ul className="flex flex-wrap gap-2">
        {seeds.map((s) => (
          <li key={s} className="flex items-center gap-1 rounded border border-border bg-secondary/70 pl-3">
            <button
              onClick={() => onSelect(s)}
              className="max-w-[160px] truncate py-2 font-mono text-xs text-foreground hover:text-primary"
            >
              {s}
            </button>
            <button
              onClick={() => onRemove(s)}
              className="px-2 py-2 text-muted-foreground transition hover:text-destructive"
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SavedSeeds;
