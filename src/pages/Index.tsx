import { useMemo, useState } from "react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SeedControls from "@/components/SeedControls";
import WorldMap from "@/components/WorldMap";
import BiomeLegend from "@/components/BiomeLegend";
import WorldStats from "@/components/WorldStats";
import StructureList from "@/components/StructureList";
import SavedSeeds from "@/components/SavedSeeds";
import { generateWorld, randomSeed } from "@/lib/seed-engine";

const STORAGE_KEY = "seedcraft.saved";

const Index = () => {
  const [seed, setSeed] = useState("-4172144997902289642");
  const [saved, setSaved] = useState<string[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  });

  const world = useMemo(() => generateWorld(seed || "0"), [seed]);

  const persist = (next: string[]) => {
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleSave = () => {
    const value = seed.trim();
    if (!value) return;
    if (saved.includes(value)) {
      persist(saved.filter((s) => s !== value));
      toast("Seed removed");
    } else {
      persist([value, ...saved].slice(0, 24));
      toast.success("Seed saved");
    }
  };

  const randomize = () => {
    const next = randomSeed();
    setSeed(next);
    console.log("Randomized seed:", next);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="animate-fade-in">
          <h1 className="font-pixel text-xl leading-relaxed text-foreground sm:text-2xl">
            Explore any <span className="text-primary">seed</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Paste a seed or roll a random one to preview the spawn area, biome mix and nearby
            structures before you build your next world.
          </p>
        </div>

        <SeedControls
          seed={seed}
          seedNumber={world.seedNumber}
          onSeedChange={setSeed}
          onRandomize={randomize}
          onSave={toggleSave}
          isSaved={saved.includes(seed.trim())}
        />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <WorldMap world={world} />
          <div className="space-y-6">
            <BiomeLegend world={world} />
            <StructureList world={world} />
          </div>
        </div>

        <WorldStats world={world} />

        <SavedSeeds
          seeds={saved}
          onSelect={setSeed}
          onRemove={(s) => persist(saved.filter((x) => x !== s))}
        />

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Previews are generated locally and are an artistic approximation, not an exact
          Minecraft world generation.
        </footer>
      </main>
    </div>
  );
};

export default Index;
