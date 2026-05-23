"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, ArrowUpRight, ShoppingBasket } from "lucide-react";
import { BUNDLES, formatRp } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { CursorGlowCard } from "@/components/ui/cursor-glow-card";
import { toast } from "sonner";

interface CatalogProps {
  qty: Record<string, number>;
  setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  livePrice: number;
}

export function Catalog({ qty, setQty, livePrice }: CatalogProps) {
  const getDynamicPrice = (b: typeof BUNDLES[0]) => {
    return b.multiplier ? Math.round(b.multiplier * livePrice / 100) * 100 : b.basePrice;
  };

  const setQ = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, n) }));
  const total = useMemo(() => BUNDLES.reduce((s, b) => s + (qty[b.id] || 0) * getDynamicPrice(b), 0), [qty, livePrice]);
  const itemCount = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);

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
            <motion.a
              href="#pesan"
              key={itemCount}
              animate={itemCount > 0 ? { scale: [1, 1.18, 0.93, 1.06, 1], y: [0, -5, 2, -2, 0] } : {}}
              transition={{ duration: 0.55, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeOut" }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative overflow-hidden rounded-sm bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-background"
            >
              {itemCount > 0 && (
                <motion.span
                  layoutId="cart-glow"
                  initial={{ opacity: 0.9, scale: 1.2 }}
                  animate={{ opacity: 0, scale: 2.2 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-0 rounded-sm bg-accent"
                />
              )}
              <span className="relative">Keranjang · {itemCount} paket / {formatRp(total)}</span>
            </motion.a>
          </FadeIn>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUNDLES.map((b, i) => {
            const q = qty[b.id] || 0;
            return (
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

                  <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Harga</div>
                      <span className="font-serif text-3xl tracking-tight text-foreground">{formatRp(getDynamicPrice(b))}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-sm border border-border bg-background">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQ(b.id, q - 1)} className="grid size-8 place-items-center text-muted-foreground hover:bg-secondary" aria-label="kurangi">
                        <Minus className="size-3.5" />
                      </motion.button>
                      <AnimatePresence mode="popLayout">
                        <motion.span key={q} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.18 }} className="w-6 text-center font-mono text-sm">
                          {q}
                        </motion.span>
                      </AnimatePresence>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQ(b.id, q + 1)} className="grid size-8 place-items-center text-muted-foreground hover:bg-secondary" aria-label="tambah">
                        <Plus className="size-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.a
                    href="#pesan"
                    onClick={() => { if (q === 0) setQ(b.id, 1); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-5 inline-flex items-center justify-between rounded-sm bg-foreground px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-background"
                  >
                    Pesan paket ini
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowUpRight className="size-3.5" />
                    </motion.span>
                  </motion.a>
                </CursorGlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
