export function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-xs sm:max-w-none whitespace-normal break-words">© 2026 Telur Mojokrapak — Mojokrapak, Jombang, Jawa Timur</div>
        <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {["Tentang", "Harga", "Paket", "Pesan", "Lokasi"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="transition hover:text-foreground">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
