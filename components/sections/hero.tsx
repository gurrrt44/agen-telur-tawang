"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroMx = useMotionValue(0);
  const heroMy = useMotionValue(0);
  const heroBg = useTransform(
    [heroMx, heroMy],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(232,168,56,0.22), transparent 55%)`
  );

  return (
    <section
      ref={heroRef}
      onMouseMove={(e) => {
        const r = heroRef.current!.getBoundingClientRect();
        heroMx.set(e.clientX - r.left);
        heroMy.set(e.clientY - r.top);
      }}
      className="relative overflow-hidden border-b border-border"
    >
      <motion.div style={{ background: heroBg }} className="pointer-events-none absolute inset-0" />
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full border border-dashed border-accent/30"
      />
      <motion.div
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -right-20 -top-20 size-[280px] rounded-full border border-dashed border-accent/40"
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-24">
        <div className="lg:col-span-7">
          <FadeIn><SectionLabel n="00" label="Katalog Tahun Berjalan — 2026" /></FadeIn>
          <h1 className="mt-8 font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">
            {["Telur ayam segar,", "dari kandang ke", "dapur Anda,", "setiap pagi."].map((line, i) => (
              <motion.span
                key={i}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <FadeIn delay={0.5}>
            <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
              "Agen Telur Tawang" memasok telur ayam grade A pilihan untuk rumah tangga, warung, dan resto di sekitar Tawang, Mojokrapak dan sekitarnya. Dikemas hari yang sama, diantar dalam 24 jam.
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <motion.a href="#paket" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-sm bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-background">
                Lihat Paket <ArrowUpRight className="size-3.5" />
              </motion.a>
              <motion.a href="#harga" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] hover:bg-secondary">
                Harga Hari Ini
              </motion.a>
            </div>
          </FadeIn>

          <FadeIn delay={0.8}>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8 border-t border-border pt-8">
              {[{ k: "Peternak Mitra", v: "17" }, { k: "Butir / Hari", v: "8.400" }, { k: "Pelanggan Aktif", v: "312" }].map((s, i) => (
                <motion.div key={s.k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: 0.1 * i, duration: 0.6 }}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.k}</dt>
                  <dd className="mt-2 font-serif text-3xl">{s.v}</dd>
                </motion.div>
              ))}
            </dl>
          </FadeIn>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <figure className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="aspect-[4/5] w-full overflow-hidden bg-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/gps-cs-s/APNQkAEyP5OairPaDJ_NC2QW_r2U5lN62wtmp6CMKhm9pzb7uMyzOPjI4cne664p-vcOX4USUgJZhWNjoCcLpfjFXCw3aNytsI-PJ0xaNftcX668u1xSPUeiPwGGJFgQqj1TIPU77DWE=w900-h1125-k-no" alt="Agen Telur Tawang - foto toko" className="size-full object-cover transition duration-700 hover:scale-110" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -left-6 -top-6 grid size-24 place-items-center rounded-full bg-accent text-foreground"
            >
              <div className="text-center font-mono text-[9px] uppercase leading-tight tracking-[0.2em]">
                Grade A<br />★★★★★<br />Fresh
              </div>
            </motion.div>
            <figcaption className="mt-3 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Plate I — Grade A, coklat</span>
              <span>No. 0142 / 2026</span>
            </figcaption>
          </figure>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden border-t border-border bg-foreground py-3 text-background">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex w-max gap-12 font-mono text-xs uppercase tracking-[0.3em]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              Telur Segar Tiap Pagi
              <Sparkles className="size-3 text-accent" />
              Antar 24 Jam
              <Sparkles className="size-3 text-accent" />
              Grade A Tersortir
              <Sparkles className="size-3 text-accent" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
