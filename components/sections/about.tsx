"use client";

import { motion } from "motion/react";
import { Leaf, ShieldCheck, Egg, Truck } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { CursorGlowCard } from "@/components/ui/cursor-glow-card";

export function About() {
  return (
    <section id="tentang" className="scroll-mt-20 border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="01" label="Tentang Telur Kami" /></FadeIn>
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <FadeIn delay={0.1} className="lg:col-span-5">
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              Empat hal yang membuat telur agen tawang beda <em className="italic text-accent">berbeda</em>.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:col-span-7">
            {[
              { icon: Leaf, t: "Pelayanan Ramah", d: "Siap melayani dengan senyuman dan membantu jika anda membutuhkan bantuan." },
              { icon: ShieldCheck, t: "Harga Terjangkau", d: "Harga yang bersaing dan terjangkau untuk semua kalangan." },
              { icon: Egg, t: "Segar hari ini", d: "Dikumpulkan pagi, didistribusikan Pagi langsung. " },
              { icon: Truck, t: "Antar terjadwal", d: "Radius 25 km gratis ongkir untuk pesanan di atas Rp 50.000." },
            ].map((f, i) => (
              <CursorGlowCard key={f.t} className="bg-background p-7">
                <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: i * 0.08, duration: 0.6 }}>
                  <motion.div whileHover={{ rotate: 12, scale: 1.15 }} transition={{ type: "spring", stiffness: 300 }}>
                    <f.icon className="size-5 text-accent" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="mt-5 font-serif text-xl">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
                </motion.div>
              </CursorGlowCard>
            ))}
          </div>
        </div>

        <FadeIn delay={0.2}>
          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {[{ k: "Protein", v: "6,3 g", s: "per butir 50 g" }, { k: "Kolesterol", v: "186 mg", s: "—" }, { k: "Umur simpan", v: "21 hari", s: "suhu ruang" }].map((s) => (
              <CursorGlowCard key={s.k} className="bg-background p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.k}</div>
                <div className="mt-3 font-serif text-4xl">{s.v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.s}</div>
              </CursorGlowCard>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
