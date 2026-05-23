"use client";

import { motion } from "motion/react";
import { Egg, ArrowUpRight } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="grid size-9 place-items-center rounded-sm bg-foreground text-background"
          >
            <Egg className="size-4" strokeWidth={1.5} />
          </motion.div>
          <div className="leading-tight">
            <div className="font-serif text-lg">Agen Telur Tawang</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">est. 2008 — Mojokrapak, Jombang, Jawa Timur</div>
          </div>
        </div>
        <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {["Tentang", "Harga", "Paket", "Pesan", "Lokasi"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="group relative">
              <span className="transition group-hover:text-foreground">{l}</span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <motion.a
          href="#pesan"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-sm bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-background"
        >
          Pesan <ArrowUpRight className="size-3.5" />
        </motion.a>
      </div>
    </motion.header>
  );
}
