"use client";

import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";

export function Location() {
  return (
    <section id="lokasi" className="scroll-mt-20 border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="05" label="Kunjungi Toko" dark /></FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <FadeIn delay={0.1} className="lg:col-span-5">
            <div>
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                Kunjungi Toko — <em className="italic text-accent">mampir</em>, lihat sendiri.
              </h2>

              <dl className="mt-10 space-y-6">
                {[
                  { I: MapPin, k: "Alamat", v: <>Jl. Setia No. 12, Tawang<br />Mojokrapak, Jombang, Jawa Timur</> },
                  { I: Phone, k: "Kontak 1", v: "+62 856 0468 6769" },
                  { I: Phone, k: "Kontak 2", v: "+62 856 0602 2228" },
                  { I: Clock, k: "Jam buka", v: <>Senin – Sabtu, 06.00 – 17.00<br />Minggu, 06.00 – 10.00</> },
                ].map((row, i) => (
                  <motion.div key={row.k} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.1 * i }} className="flex items-start gap-4">
                    <row.I className="mt-1 size-5 text-accent" strokeWidth={1.5} />
                    <div>
                      <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">{row.k}</dt>
                      <dd className="mt-1 font-serif text-xl leading-snug font-medium">{row.v}</dd>
                    </div>
                  </motion.div>
                ))}
              </dl>

              <motion.a
                href="https://www.google.com/maps/place/Agen+Telur+Tawang/@-7.507676,112.230529,835m/data=!3m1!1e3!4m6!3m5!1s0x2e783f0034379453:0xe8187193e15c17a9!8m2!3d-7.5076757!4d112.2305286!16s%2Fg%2F11v_3_7dbq?hl=id&entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-10 inline-flex items-center gap-2 rounded-sm bg-accent px-7 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.16em] text-foreground shadow-md hover:shadow-lg"
              >
                Buka di Google Maps <ArrowUpRight className="size-4" />
              </motion.a>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="lg:col-span-7">
            <div>
              <motion.div whileHover={{ scale: 1.01 }} className="aspect-[4/3] w-full overflow-hidden border border-background/15 bg-background/10">
                <iframe
                  title="Lokasi Toko Agen Telur Tawang"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3636.2814008340683!2d112.230522!3d-7.5076949!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e783f0034379453%3A0xe8187193e15c17a9!2sAgen%20Telur%20Tawang!5e1!3m2!1sid!2sid!4v1779515158467!5m2!1sid!2sid"
                  className="size-full"
                  style={{ filter: "grayscale(0.4) contrast(1.05)" }}
                  loading="lazy"
                />
              </motion.div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background/60">
                <span>Peta — Tawang, Mojokrapak, Jombang</span>
                <span>−7.6121° S · 112.3426° E</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
