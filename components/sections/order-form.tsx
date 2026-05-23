"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { BUNDLES, formatRp } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";

interface OrderFormProps {
  qty: Record<string, number>;
  setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  livePrice: number;
}

export function OrderForm({ qty, setQty, livePrice }: OrderFormProps) {
  const [form, setForm] = useState({ nama: "", telp: "", alamat: "", catatan: "", metode: "antar" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDynamicPrice = (b: typeof BUNDLES[0]) => {
    return b.multiplier ? Math.round(b.multiplier * livePrice / 100) * 100 : b.basePrice;
  };

  const total = useMemo(() => BUNDLES.reduce((s, b) => s + (qty[b.id] || 0) * getDynamicPrice(b), 0), [qty, livePrice]);
  const itemCount = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemCount === 0) return toast.error("Pilih dulu paket telur yang ingin dipesan.");
    if (!form.nama || !form.telp) return toast.error("Nama dan nomor telepon wajib diisi.");

    setIsSubmitting(true);
    setIsSubmitting(true);

    const itemsText = BUNDLES
      .filter((b) => (qty[b.id] || 0) > 0)
      .map((b) => `- ${b.name} (${b.weight}) x ${qty[b.id]} = ${formatRp(getDynamicPrice(b) * qty[b.id]!)}`)
      .join("\n");

    const message = `Halo Agen Telur Tawang,

Saya ingin memesan telur dengan rincian berikut:

*DATA PEMESAN*
Nama: ${form.nama}
Alamat Pengantaran: ${form.alamat}
Metode: ${form.metode === "antar" ? "Diantar" : "Ambil di Toko"}
Catatan: ${form.catatan || "-"}

*RINCIAN PESANAN*
${itemsText}

*TOTAL: ${formatRp(total)}*

Mohon segera diproses. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/6285606022228?text=${encodedMessage}`;

    window.open(waUrl, "_blank");

    toast.success("Membuka WhatsApp...", {
      description: "Silakan kirim pesan yang sudah otomatis dirangkum.",
    });

    setQty({});
    setForm({ nama: "", telp: "", alamat: "", catatan: "", metode: "antar" });
    setIsSubmitting(false);
  };

  return (
    <section id="pesan" className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="04" label="Pemesanan Online" /></FadeIn>
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <FadeIn delay={0.1} className="lg:col-span-5">
            <div>
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">Ringkasan pesanan.</h2>
              <p>harga akan disesuaikan dengan keputusan dari toko kami dan pertimbangan dari harga pasar <a href="#" className="text-sm underline underline-offset-4">Hubungi Kami</a>.</p>
              <p className="mt-4 text-muted-foreground">
                <span className="font-bold">Catatan:</span> Kalau anda bingung untuk menentukan berapa pesanan anda lebih baik langsung tekan <a href="#" className="text-sm underline underline-offset-4">Hubungi Kami</a>.</p>
              <div className="mt-8 border border-border bg-card">

                {BUNDLES.filter((b) => (qty[b.id] || 0) > 0).length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 p-10 text-center">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                      <ShoppingBasket className="size-7 text-muted-foreground" strokeWidth={1.5} />
                    </motion.div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Keranjang masih kosong</p>
                    <a href="#paket" className="text-sm underline underline-offset-4">Pilih paket terlebih dahulu</a>
                  </motion.div>
                ) : (
                  <>
                    <ul className="divide-y divide-border">
                      <AnimatePresence>
                        {BUNDLES.filter((b) => (qty[b.id] || 0) > 0).map((b) => (
                          <motion.li
                            key={b.id}
                            layout
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            className="flex items-center justify-between p-5"
                          >
                            <div>
                              <div className="font-serif text-lg">{b.name}</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{b.weight} • {qty[b.id]} ×</div>
                            </div>
                            <div className="font-serif text-lg">{formatRp(getDynamicPrice(b) * (qty[b.id] || 0))}</div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                    <div className="flex items-center justify-between border-t border-border bg-secondary/50 p-5">
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</span>
                      <motion.span key={total} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="font-serif text-3xl">{formatRp(total)}</motion.span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-5 border border-border bg-card p-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nama lengkap</span>
                  <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent" placeholder="Ibu Wulandari" />
                </label>
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alamat pengantaran</span>
                <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent" placeholder="Jl. Jalan Setia No. 12, Mojokrapak" />
              </label>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Metode pengiriman</span>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[{ k: "antar", t: "Antar ke alamat", s: "Gratis ≥ Rp 50.000" }, { k: "ambil", t: "Ambil di toko", s: "Siap dalam 30 menit" }].map((m) => (
                    <motion.button
                      key={m.k}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, metode: m.k })}
                      className={`relative flex flex-col items-start gap-1 overflow-hidden border p-4 text-left transition ${form.metode === m.k ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"}`}
                    >
                      <span className="font-serif text-lg">{m.t}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${form.metode === m.k ? "text-background/70" : "text-muted-foreground"}`}>{m.s}</span>
                      {form.metode === m.k && <motion.span layoutId="method-mark" className="absolute right-3 top-3 size-2 rounded-full bg-accent" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Catatan (opsional)</span>
                <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={3} className="mt-2 w-full resize-none border border-border bg-transparent p-3 text-sm outline-none transition-colors focus:border-accent" placeholder="Mohon kemas dalam kardus, antar setelah jam 4 sore." />
              </label>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex w-full items-center justify-between overflow-hidden rounded-sm bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-background disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 group-hover:translate-x-0" />
                <span className="relative z-10 group-hover:text-foreground">
                  {isSubmitting ? "Mengirim..." : `Kirim pesanan • ${formatRp(total)}`}
                </span>
                <ArrowUpRight className="relative z-10 size-4 group-hover:text-foreground" />
              </motion.button>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Pembayaran setelah pesanan dikonfirmasi (transfer / COD)
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
