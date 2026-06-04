"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BUNDLES } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";

const WA_NUMBER = "6285606022228";

interface OrderFormProps {
  selectedBundle: string;
  onBundleChange: (id: string) => void;
}

export function OrderForm({ selectedBundle, onBundleChange }: OrderFormProps) {
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    metode: "antar",
    catatan: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama) return;

    const paketLabel = selectedBundle
      ? BUNDLES.find((b) => b.id === selectedBundle)?.name ?? selectedBundle
      : "belum dipilih";

    const message =
      `Halo Agen Telur Tawang 👋\n\n` +
      `Saya ingin memesan telur dengan rincian berikut:\n\n` +
      `*Nama:* ${form.nama}\n` +
      `*Paket:* ${paketLabel}\n` +
      `*Metode:* ${form.metode === "antar" ? "Diantar ke alamat" : "Ambil di toko"}\n` +
      (form.alamat ? `*Alamat:* ${form.alamat}\n` : "") +
      (form.catatan ? `*Catatan:* ${form.catatan}\n` : "") +
      `\nMohon konfirmasi ketersediaan dan harga. Terima kasih! 🙏`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="pesan" className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="04" label="Pemesanan — via WhatsApp" /></FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Kiri — info */}
          <FadeIn delay={0.1} className="lg:col-span-5">
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              Isi form, lalu kami konfirmasi harga & ketersediaan.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Harga telur mengikuti kondisi pasar harian dan kebijakan toko. Setelah form dikirim via WhatsApp, kami akan segera membalas dengan konfirmasi harga dan estimasi pengiriman.
            </p>
            <div className="mt-8 space-y-4 border border-border bg-card p-6">
              {[
                { n: "01", t: "Isi form pesanan", d: "Pilih paket, isi nama & alamat" },
                { n: "02", t: "Kirim via WhatsApp", d: "Pesan dikirim otomatis ke toko" },
                { n: "03", t: "Konfirmasi harga", d: "Toko membalas harga & jadwal" },
                { n: "04", t: "Telur diantar", d: "Segar, dikemas rapi, tepat waktu" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{s.n}</span>
                  <div>
                    <div className="font-serif text-base">{s.t}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Kanan — form */}
          <FadeIn delay={0.2} className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-5 border border-border bg-card p-7">
              {/* Nama */}
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nama lengkap *</span>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent"
                  placeholder="Ibu Wulandari"
                />
              </label>

              {/* Pilih paket */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Paket yang diminati</span>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BUNDLES.map((b) => (
                    <motion.button
                      key={b.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onBundleChange(selectedBundle === b.id ? "" : b.id)}
                      className={`flex flex-col items-start gap-0.5 border p-3 text-left transition ${
                        selectedBundle === b.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="font-serif text-sm">{b.name}</span>
                      <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${selectedBundle === b.id ? "text-background/70" : "text-muted-foreground"}`}>
                        {b.weight}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Metode */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Metode pengiriman</span>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { k: "antar", t: "Antar ke alamat", s: "Gratis ≥ Rp 50.000" },
                    { k: "ambil", t: "Ambil di toko", s: "Siap dalam 30 menit" },
                  ].map((m) => (
                    <motion.button
                      key={m.k}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, metode: m.k })}
                      className={`relative flex flex-col items-start gap-1 overflow-hidden border p-4 text-left transition ${
                        form.metode === m.k ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="font-serif text-base">{m.t}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${form.metode === m.k ? "text-background/70" : "text-muted-foreground"}`}>
                        {m.s}
                      </span>
                      {form.metode === m.k && <motion.span layoutId="method-mark" className="absolute right-3 top-3 size-2 rounded-full bg-accent" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Alamat (jika antar) */}
              {form.metode === "antar" && (
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alamat pengantaran</span>
                  <input
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent"
                    placeholder="Jl. Setia No. 12, Mojokrapak"
                  />
                </label>
              )}

              {/* Catatan */}
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Catatan (opsional)</span>
                <textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  rows={3}
                  className="mt-2 w-full resize-none border border-border bg-transparent p-3 text-sm outline-none transition-colors focus:border-accent"
                  placeholder="Antar setelah jam 4 sore, kemas dalam kardus."
                />
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex w-full items-center justify-between overflow-hidden rounded-sm bg-[#25D366] px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white"
              >
                <span className="absolute inset-0 -translate-x-full bg-[#1fb855] transition-transform duration-500 group-hover:translate-x-0" />
                <span className="relative z-10 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Kirim pesanan via WhatsApp
                </span>
                <ArrowUpRight className="relative z-10 size-4" />
              </motion.button>

              <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Harga dikonfirmasi langsung oleh toko · Bayar setelah konfirmasi
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
