import { Boxes, Github } from "lucide-react";

const SiteHeader = () => (
  <header className="border-b border-border/70 bg-card/60 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded bg-primary text-primary-foreground pixel-border">
          <Boxes size={20} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-pixel text-[11px] leading-none tracking-tight text-primary">SEEDCRAFT</p>
          <p className="mt-1 text-xs text-muted-foreground">Seed viewer &amp; randomizer</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <Github size={14} />
        <span>Java-style seeds · offline preview</span>
      </div>
    </div>
  </header>
);

export default SiteHeader;
