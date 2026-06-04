"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BUNDLES } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { CursorGlowCard } from "@/components/ui/cursor-glow-card";

interface CatalogProps {
  onSelectBundle: (id: string) => void;
}

export function Catalog({ onSelectBundle }: CatalogProps) {
  const handlePesan = (id: string) => {
    onSelectBundle(id);
    document.getElementById("pesan")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="paket" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="03" label="Katalog Paket — pilih, lalu pesan" /></FadeIn>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <FadeIn delay={0.1}>
            <h2 className="max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Enam paket, dari satu sarapan <em className="italic text-accent">hingga</em> satu krat untuk resto.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Harga ditentukan toko · Chat WA untuk konfirmasi
            </p>
          </FadeIn>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUNDLES.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.78, y: 32, rotateX: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 240, damping: 17, mass: 0.9 }}
              whileHover={{ scale: 1.03, y: -8, transition: { type: "spring", stiffness: 320, damping: 18 } }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <CursorGlowCard className="flex h-full flex-col border border-border bg-card p-7 transition hover:border-foreground/40">
                <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>No. {String(i + 1).padStart(2, "0")}</span>
                  <motion.span
                    whileHover={{ scale: 1.08, rotate: -2 }}
                    className="rounded-sm bg-accent/15 px-2 py-1 text-accent"
                  >
                    {b.tag}
                  </motion.span>
                </div>

                <h3 className="mt-5 font-serif text-2xl">{b.name}</h3>
                <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {b.weight} • {b.count}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{b.note}</p>

                {/* Harga: hubungi toko */}
                <div className="mt-6 border-t border-border pt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Harga</div>
                  <div className="mt-1 font-serif text-lg text-muted-foreground italic">Hubungi toko untuk harga terkini</div>
                </div>

                {/* Tombol ke Form */}
                <motion.button
                  onClick={() => handlePesan(b.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 inline-flex w-full items-center justify-between rounded-sm bg-foreground px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-background"
                >
                  Pesan paket ini
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowUpRight className="size-3.5" />
                  </motion.span>
                </motion.button>
              </CursorGlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
