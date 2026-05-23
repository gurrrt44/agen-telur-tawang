import { useMemo, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useInView } from "motion/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,

  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Phone,
  Clock,
  Egg,
  Leaf,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { Toaster, toast } from "sonner";

type Bundle = {
  id: string;
  name: string;
  weight: string;
  count: string;
  price: number;
  tag: string;
  note: string;
};

const BUNDLES: Bundle[] = [
  { id: "qtr", name: "Paket Saku", weight: "¼ kg", count: "± 4 butir", price: 9000, tag: "Coba dulu", note: "Cocok untuk satu sarapan keluarga kecil." },
  { id: "half", name: "Paket Dapur", weight: "½ kg", count: "± 8 butir", price: 17500, tag: "Sering dipesan", note: "Stok harian untuk masakan rumahan sederhana." },
  { id: "one", name: "Paket Rumah", weight: "1 kg", count: "± 16 butir", price: 33000, tag: "Favorit", note: "Pilihan paling laris — telur segar pilihan grade A." },
  { id: "tray", name: "Paket Tray", weight: "1 peti", count: "30 butir", price: 58000, tag: "Hemat", note: "Disusun rapi dalam tray karton, aman untuk diantar." },
  { id: "warung", name: "Paket Warung", weight: "5 kg", count: "± 80 butir", price: 158000, tag: "Grosir", note: "Untuk warung, katering, atau bakery skala kecil." },
  { id: "resto", name: "Paket Resto", weight: "1 krat (10 kg)", count: "± 160 butir", price: 310000, tag: "Langganan", note: "Pengiriman terjadwal, harga khusus mitra resto." },
];

const MARKETS = [
  { id: "klaten", name: "Pasar Klaten", city: "Klaten", base: 33000, coord: "−7.70° S · 110.60° E" },
  { id: "beringharjo", name: "Pasar Beringharjo", city: "Yogyakarta", base: 33800, coord: "−7.80° S · 110.36° E" },
  { id: "gede", name: "Pasar Gede", city: "Solo", base: 32600, coord: "−7.56° S · 110.83° E" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function SectionLabel({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <div className={`flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.18em] ${dark ? "text-background/60" : "text-muted-foreground"}`}>
      <span className="text-accent">§ {n}</span>
      <span className={`h-px flex-1 ${dark ? "bg-background/15" : "bg-border"}`} />
      <span>{label}</span>
    </div>
  );
}

function DigitColumn({ digit, delay = 0 }: { digit: string; delay?: number }) {
  const n = parseInt(digit);
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: "1.05em", width: "0.62em", verticalAlign: "bottom" }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        animate={{ y: `${-n * 10}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 24, delay }}
        style={{ height: "1000%", lineHeight: "1.05em" }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} style={{ height: "10%", display: "flex", alignItems: "flex-end" }}>{d}</span>
        ))}
      </motion.span>
    </span>
  );
}

function OdometerPrice({ value }: { value: number }) {
  const str = Math.round(value).toLocaleString("id-ID");
  const chars = str.split("");
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let di = 0;
  return (
    <span className="inline-flex items-baseline">
      <span>Rp&nbsp;</span>
      {chars.map((char, i) => {
        if (!/\d/.test(char)) return <span key={i}>{char}</span>;
        const pos = di++;
        return <DigitColumn key={i} digit={char} delay={(digitCount - 1 - pos) * 0.045} />;
      })}
    </span>
  );
}

function CursorGlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const bg = useTransform(
    [mx, my],
    ([x, y]) => `radial-gradient(280px circle at ${x}px ${y}px, rgba(232,168,56,0.18), transparent 60%)`
  );
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => { mx.set(-200); my.set(-200); }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div style={{ background: bg }} className="pointer-events-none absolute inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, y = 16, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  // Market selection + live price
  const [marketId, setMarketId] = useState("klaten");
  const market = MARKETS.find((m) => m.id === marketId)!;
  const [livePrice, setLivePrice] = useState(market.base);
  const [prevTick, setPrevTick] = useState(market.base);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setLivePrice(market.base);
    setPrevTick(market.base);
    setAnimKey((k) => k + 1);
  }, [marketId]);

  useEffect(() => {
    const id = setInterval(() => {
      setLivePrice((p) => {
        setPrevTick(p);
        const delta = Math.round((Math.random() - 0.45) * 220);
        return Math.max(market.base - 1500, Math.min(market.base + 2000, p + delta));
      });
    }, 2400);
    return () => clearInterval(id);
  }, [market.base]);

  const trend = livePrice - prevTick;
  const pct = (trend / prevTick) * 100;

  // Daily series — kemarin / kini / besok
  const yesterday = market.base - 250;
  const today = livePrice;
  const tomorrow = Math.round(today + (today - yesterday) * 1.3 + 180);

  const dailySeries = [
    { label: "−6h", v: market.base - 600, f: null as number | null },
    { label: "−5h", v: market.base - 480, f: null },
    { label: "−4h", v: market.base - 350, f: null },
    { label: "−3h", v: market.base - 280, f: null },
    { label: "Lusa", v: market.base - 320, f: null },
    { label: "Kemarin", v: yesterday, f: null },
    { label: "Kini", v: today, f: today },
    { label: "Besok", v: null, f: tomorrow },
  ];

  const sparkData = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ t: i, v: market.base + Math.sin(i / 2 + livePrice / 800) * 220 + (i === 15 ? livePrice - market.base : 0) })),
    [livePrice, market.base]
  );

  // Cart
  const [qty, setQty] = useState<Record<string, number>>({});
  const setQ = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, n) }));
  const total = useMemo(() => BUNDLES.reduce((s, b) => s + (qty[b.id] || 0) * b.price, 0), [qty]);
  const itemCount = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);

  const [form, setForm] = useState({ nama: "", telp: "", alamat: "", catatan: "", metode: "antar" });
  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemCount === 0) return toast.error("Pilih dulu paket telur yang ingin dipesan.");
    if (!form.nama || !form.telp) return toast.error("Nama dan nomor telepon wajib diisi.");
    toast.success("Pesanan diterima", { description: `${itemCount} paket • ${formatRp(total)} • kami hubungi via WhatsApp.` });
    setQty({});
    setForm({ nama: "", telp: "", alamat: "", catatan: "", metode: "antar" });
  };

  // Chart in-view trigger
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: false, margin: "-60px" });

  // Hero cursor follow
  const heroRef = useRef<HTMLDivElement>(null);
  const heroMx = useMotionValue(0);
  const heroMy = useMotionValue(0);
  const heroBg = useTransform([heroMx, heroMy], ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(232,168,56,0.22), transparent 55%)`);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Toaster position="top-center" richColors />

      {/* Header */}
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
              <div className="font-serif text-lg">Telur Sari Tani</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">est. 2014 — Klaten</div>
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

      {/* Hero */}
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
                  {i === 1 ? (<>dari kandang ke</>) : line}
                </motion.span>
              ))}
            </h1>
            <FadeIn delay={0.5}>
              <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
                Sari Tani memasok telur ayam negeri grade A pilihan untuk rumah tangga, warung, dan resto di sekitar Klaten dan Yogyakarta. Dikemas hari yang sama, diantar dalam 24 jam.
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
                  <motion.div key={s.k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.6 }}>
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
                <img src="https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=900&h=1125&fit=crop&auto=format" alt="Tray telur ayam coklat segar" className="size-full object-cover transition duration-700 hover:scale-110" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -left-6 -top-6 grid size-24 place-items-center rounded-full bg-accent text-foreground"
              >
                <div className="text-center font-mono text-[9px] uppercase leading-tight tracking-[0.2em]">
                  Grade A<br/>★★★★★<br/>Fresh
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

      {/* Informasi */}
      <section id="tentang" className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <FadeIn><SectionLabel n="01" label="Tentang Telur Kami" /></FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <FadeIn delay={0.1} className="lg:col-span-5">
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                Empat hal yang membuat telur Sari Tani <em className="italic text-accent">berbeda</em>.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:col-span-7">
              {[
                { icon: Leaf, t: "Pakan alami", d: "Campuran jagung, dedak, dan suplemen herbal — tanpa hormon pemicu." },
                { icon: ShieldCheck, t: "Grade A tersortir", d: "Setiap butir disortir manual; cangkang retak dipisahkan dari kemasan jual." },
                { icon: Egg, t: "Segar hari ini", d: "Dikumpulkan pagi, didistribusikan sore. Maksimal 24 jam dari kandang." },
                { icon: Truck, t: "Antar terjadwal", d: "Radius 25 km gratis ongkir untuk pesanan di atas Rp 50.000." },
              ].map((f, i) => (
                <CursorGlowCard key={f.t} className="bg-background p-7">
                  <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}>
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

      {/* Harga */}
      <section id="harga" className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <FadeIn><SectionLabel n="02" label="Indeks Harga Telur — per kg" /></FadeIn>

          {/* Market selector */}
          <FadeIn delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pilih pasar:</span>
              {MARKETS.map((m) => (
                <motion.button
                  key={m.id}
                  onClick={() => setMarketId(m.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] transition ${marketId === m.id ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"}`}
                >
                  {m.name} · {m.city}
                  {marketId === m.id && (
                    <motion.span layoutId="market-dot" className="absolute -right-1 -top-1 size-2 rounded-full bg-accent" />
                  )}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Live price card */}
            <FadeIn delay={0.15} className="lg:col-span-4">
              <CursorGlowCard className="border border-border bg-card p-7">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Real-time · {market.name}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <motion.span animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="size-1.5 rounded-full bg-accent" />
                    Live
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Lokasi · {market.city} · {market.coord}
                </div>

                <div className="mt-5 font-serif text-5xl tracking-tight">
                  <OdometerPrice value={livePrice} />
                </div>

                <div className={`mt-3 inline-flex items-center gap-1.5 font-mono text-xs ${trend >= 0 ? "text-destructive" : "text-emerald-700"}`}>
                  {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {trend >= 0 ? "+" : ""}{trend} ({pct.toFixed(2)}%) dari harga sebelumnya
                </div>

                <div className="mt-6 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e8a838" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#e8a838" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#e8a838" strokeWidth={1.5} fill="url(#g1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-5 font-mono text-[11px]">
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground">Tertinggi hari ini</dt>
                  <dd className="text-right">{formatRp(market.base + 450)}</dd>
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground">Terendah hari ini</dt>
                  <dd className="text-right">{formatRp(market.base - 300)}</dd>
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground">Volume</dt>
                  <dd className="text-right">8.4k butir</dd>
                  <dt className="uppercase tracking-[0.16em] text-muted-foreground">Pembaruan</dt>
                  <dd className="text-right">tiap 2,4 dtk</dd>
                </dl>
              </CursorGlowCard>
            </FadeIn>

            {/* Chart kemarin / kini / besok */}
            <FadeIn delay={0.25} className="lg:col-span-8">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl">
                  Kemarin · <em className="italic text-accent">Kini</em> · Prediksi Besok
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  Pergerakan harga {market.name.toLowerCase()} dari sore kemarin sampai prediksi besok pagi. Garis utuh adalah data aktual, garis putus-putus adalah prediksi.
                </p>

                {/* Three big stats */}
                <div className="mt-6 grid grid-cols-3 gap-px border border-border bg-border">
                  {/* Harga Kemarin */}
                  <div className="bg-card p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Harga Kemarin</div>
                    <div className="mt-2 font-serif text-2xl md:text-3xl text-muted-foreground">
                      <OdometerPrice value={yesterday} />
                    </div>
                  </div>

                  {/* Harga Kini — live, flashes on change */}
                  <div className="relative overflow-hidden bg-card p-5 ring-2 ring-inset ring-accent/40">
                    {/* pulse ring */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-accent"
                      animate={{ opacity: [0.15, 0.55, 0.15] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* flash on price tick */}
                    <motion.div
                      key={today}
                      className="pointer-events-none absolute inset-0 bg-accent/12"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                    <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <motion.span
                        animate={{ scale: [1, 1.7, 1], opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="size-1.5 rounded-full bg-accent"
                      />
                      Harga Kini
                    </div>
                    <div className="relative mt-2 font-serif text-2xl md:text-3xl text-foreground">
                      <OdometerPrice value={today} />
                    </div>
                  </div>

                  {/* Prediksi Besok — shimmer scan */}
                  <div className="relative overflow-hidden bg-card p-5">
                    {/* scan line */}
                    <motion.div
                      className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                      animate={{ x: ["-100%", "500%"] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
                    />
                    {/* animated dashed top border */}
                    <motion.div
                      className="absolute left-0 right-0 top-0 h-px bg-accent"
                      style={{ backgroundImage: "repeating-linear-gradient(90deg, #e8a838 0, #e8a838 6px, transparent 6px, transparent 12px)" }}
                      animate={{ backgroundPositionX: ["0px", "24px"] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block h-px w-4 border-t border-dashed border-accent"
                      />
                      Prediksi Besok
                    </div>
                    <div className="relative mt-2 font-serif text-2xl md:text-3xl text-accent">
                      <OdometerPrice value={tomorrow} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-border bg-card p-5">
                  <div className="mb-4 flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><span className="h-px w-5 bg-foreground" /> Aktual</span>
                    <span className="inline-flex items-center gap-2"><span className="h-px w-5 border-t border-dashed border-accent" /> Prediksi</span>
                    <span className="ml-auto">{market.name} · per kilogram</span>
                  </div>
                  <style>{`
                    @keyframes besok-pulse {
                      0%   { transform: scale(1);   opacity: 0.5; }
                      100% { transform: scale(3.8); opacity: 0; }
                    }
                    .besok-ring {
                      animation: besok-pulse 2.2s ease-out infinite;
                      transform-box: fill-box;
                      transform-origin: center;
                    }
                    .besok-ring-delay {
                      animation: besok-pulse 2.2s ease-out 0.9s infinite;
                      transform-box: fill-box;
                      transform-origin: center;
                    }
                  `}</style>
                  <div className="relative h-72" ref={chartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "#6b5f4a" }} axisLine={{ stroke: "rgba(0,0,0,0.15)" }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "#6b5f4a" }} axisLine={false} tickLine={false} domain={["dataMin - 400", "dataMax + 400"]} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} width={44} />
                        <Tooltip contentStyle={{ background: "#fbfaf6", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 2, fontFamily: "JetBrains Mono", fontSize: 11 }} formatter={(v: number) => (v ? formatRp(v) : "—")} />
                        <ReferenceLine x="Kini" stroke="#e8a838" strokeDasharray="2 3" label={{ value: "sekarang", position: "top", fill: "#6b5f4a", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                        <Line key="line-v" type="monotone" dataKey="v" stroke="#1a1612" strokeWidth={2.5} dot={{ r: 3.5, fill: "#1a1612" }} activeDot={{ r: 6, strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />
                        <Line
                          key="line-f"
                          type="monotone"
                          dataKey="f"
                          stroke="#e8a838"
                          strokeWidth={2.5}
                          strokeDasharray="5 4"
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          connectNulls
                          isAnimationActive={false}
                          dot={(dotProps: any) => {
                            if (dotProps.payload.f === null || dotProps.payload.f === undefined)
                              return <g key={`fp-${dotProps.index}`} />;
                            const { cx, cy, index } = dotProps;
                            if (dotProps.payload.label === "Besok") {
                              return (
                                <g key={`fp-${index}`}>
                                  <circle className="besok-ring" cx={cx} cy={cy} r={6} fill="#e8a838" stroke="none" />
                                  <circle className="besok-ring-delay" cx={cx} cy={cy} r={6} fill="#e8a838" stroke="none" />
                                  <circle cx={cx} cy={cy} r={6} fill="#e8a838" stroke="#1a1612" strokeWidth={1.5} />
                                </g>
                              );
                            }
                            return <circle key={`fp-${index}`} cx={cx} cy={cy} r={3.5} fill="#e8a838" />;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* main curtain — reveals on scroll-in, resets on scroll-out, loops each pass */}
                    <motion.div
                      key={animKey + "-wipe"}
                      className="pointer-events-none absolute inset-0 z-10 bg-card"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: chartInView ? 0 : 1 }}
                      transition={chartInView
                        ? { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
                        : { duration: 0 }}
                      style={{ transformOrigin: "right" }}
                    />
                    {/* prediction curtain — reveals after main line, resets instantly on scroll-out */}
                    <motion.div
                      key={animKey + "-wipe-pred"}
                      className="pointer-events-none absolute inset-y-0 z-10 bg-card"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: chartInView ? 0 : 1 }}
                      transition={chartInView
                        ? { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 1.35 }
                        : { duration: 0 }}
                      style={{ left: "calc(84% - 12px)", right: 0, transformOrigin: "right" }}
                    />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Paket Bundle */}
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
                  viewport={{ once: true, margin: "-40px" }}
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
                        <div className="mt-1 font-serif text-3xl">{formatRp(b.price)}</div>
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

      {/* Pemesanan */}
      <section id="pesan" className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <FadeIn><SectionLabel n="04" label="Pemesanan Online" /></FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <FadeIn delay={0.1} className="lg:col-span-5">
              <div>
                <h2 className="font-serif text-4xl leading-tight md:text-5xl">Ringkasan pesanan.</h2>
                <p className="mt-4 text-muted-foreground">
                  Kami konfirmasi pesanan via WhatsApp dalam 10 menit, lalu kirim hari yang sama jika dipesan sebelum pukul 14.00.
                </p>

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
                              <div className="font-serif text-lg">{formatRp(b.price * (qty[b.id] || 0))}</div>
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
              <form onSubmit={submitOrder} className="space-y-5 border border-border bg-card p-7">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nama lengkap</span>
                    <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent" placeholder="Ibu Wulandari" />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No. WhatsApp</span>
                    <input value={form.telp} onChange={(e) => setForm({ ...form, telp: e.target.value })} className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent" placeholder="0812 3456 7890" />
                  </label>
                </div>

                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alamat pengantaran</span>
                  <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-lg outline-none transition-colors focus:border-accent" placeholder="Jl. Mawar No. 12, Klaten Utara" />
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex w-full items-center justify-between overflow-hidden rounded-sm bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-background"
                >
                  <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 group-hover:translate-x-0" />
                  <span className="relative z-10 group-hover:text-foreground">Kirim pesanan • {formatRp(total)}</span>
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

      {/* Lokasi */}
      <section id="lokasi" className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
          <FadeIn><SectionLabel n="05" label="Kunjungi Toko" dark /></FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <FadeIn delay={0.1} className="lg:col-span-5">
              <div>
                <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                  Toko utama kami di Klaten — <em className="italic text-accent">mampir</em>, lihat sendiri.
                </h2>

                <dl className="mt-10 space-y-6">
                  {[
                    { I: MapPin, k: "Alamat", v: <>Jl. Pemuda No. 47, Klaten Tengah<br />Klaten, Jawa Tengah 57411</> },
                    { I: Phone, k: "Kontak", v: "+62 812 2745 9981" },
                    { I: Clock, k: "Jam buka", v: <>Senin – Sabtu, 06.00 – 19.00<br />Minggu, 06.00 – 12.00</> },
                  ].map((row, i) => (
                    <motion.div key={row.k} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="flex items-start gap-4">
                      <row.I className="mt-1 size-5 text-accent" strokeWidth={1.5} />
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">{row.k}</dt>
                        <dd className="mt-1 font-serif text-lg leading-snug">{row.v}</dd>
                      </div>
                    </motion.div>
                  ))}
                </dl>

                <motion.a
                  href="https://maps.google.com/?q=Klaten+Jawa+Tengah"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-10 inline-flex items-center gap-2 rounded-sm border border-background/30 px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] hover:bg-background hover:text-foreground"
                >
                  Buka di Google Maps <ArrowUpRight className="size-3.5" />
                </motion.a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:col-span-7">
              <div>
                <motion.div whileHover={{ scale: 1.01 }} className="aspect-[4/3] w-full overflow-hidden border border-background/15 bg-background/10">
                  <iframe
                    title="Lokasi Toko Telur Sari Tani"
                    src="https://www.google.com/maps?q=Klaten,+Jawa+Tengah&output=embed"
                    className="size-full"
                    style={{ filter: "grayscale(0.4) contrast(1.05)" }}
                    loading="lazy"
                  />
                </motion.div>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">
                  <span>Peta — Klaten Tengah</span>
                  <span>−7.7050° S · 110.6065° E</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">© 2026 Telur Sari Tani — Klaten, Jawa Tengah</div>
          <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {["Tentang", "Harga", "Paket", "Pesan", "Lokasi"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="transition hover:text-foreground">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
