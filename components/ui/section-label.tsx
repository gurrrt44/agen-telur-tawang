"use client";

export function SectionLabel({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <div className={`flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.18em] ${dark ? "text-background/60" : "text-muted-foreground"}`}>
      <span className="text-accent">§ {n}</span>
      <span className={`h-px flex-1 ${dark ? "bg-background/15" : "bg-border"}`} />
      <span>{label}</span>
    </div>
  );
}
