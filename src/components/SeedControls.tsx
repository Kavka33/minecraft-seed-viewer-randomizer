import { Copy, Dices, Star } from "lucide-react";
import { toast } from "sonner";

type Props = {
  seed: string;
  seedNumber: number;
  onSeedChange: (value: string) => void;
  onRandomize: () => void;
  onSave: () => void;
  isSaved: boolean;
};

const SeedControls = ({ seed, seedNumber, onSeedChange, onRandomize, onSave, isSaved }: Props) => {
  const copy = async () => {
    await navigator.clipboard.writeText(seed);
    toast.success("Seed copied to clipboard");
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5 pixel-border">
      <label className="mb-2 block font-pixel text-[10px] uppercase tracking-wide text-muted-foreground">
        World seed
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
          placeholder="Type any word or number…"
          spellCheck={false}
          className="min-w-0 flex-1 rounded border border-input bg-background px-4 py-3 font-mono text-lg text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          <button
            onClick={onRandomize}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:translate-y-px sm:flex-none"
          >
            <Dices size={18} /> Randomize
          </button>
          <button
            onClick={copy}
            title="Copy seed"
            className="rounded border border-border bg-secondary px-3 py-3 text-secondary-foreground transition hover:border-primary/60 active:translate-y-px"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={onSave}
            title="Save seed"
            className={`rounded border px-3 py-3 transition active:translate-y-px ${
              isSaved
                ? "border-accent bg-accent/20 text-accent"
                : "border-border bg-secondary text-secondary-foreground hover:border-accent/60"
            }`}
          >
            <Star size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        numeric seed: <span className="text-diamond">{seedNumber}</span>
      </p>
    </section>
  );
};

export default SeedControls;
