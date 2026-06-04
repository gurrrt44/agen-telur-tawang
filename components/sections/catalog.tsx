"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BUNDLES } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { CursorGlowCard } from "@/components/ui/cursor-glow-card";

const WA_NUMBER = "6285606022228";

function getWaLink(bundleName: string, weight: string, count: string) {
  const text = encodeURIComponent(
    `Assalamualaikum, saya ingin memesan *${bundleName}* (${weight} / ${count}). Apakah tersedia? Terima kasih 🙏`
  );
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

export function Catalog() {
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

                {/* Tombol WA */}
                <motion.a
                  href={getWaLink(b.name, b.weight, b.count)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 inline-flex items-center justify-between rounded-sm bg-[#25D366] px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#1fb855]"
                >
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Pesan via WhatsApp
                  </span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowUpRight className="size-3.5" />
                  </motion.span>
                </motion.a>
              </CursorGlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
