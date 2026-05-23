"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MARKETS, formatRp } from "@/lib/data";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { CursorGlowCard } from "@/components/ui/cursor-glow-card";
import { OdometerPrice } from "@/components/ui/odometer-price";

interface PricingProps {
  onPriceChange?: (price: number) => void;
}

export function Pricing({ onPriceChange }: PricingProps) {
  const [marketId, setMarketId] = useState("jombang");

  const market = MARKETS.find((m) => m.id === marketId)!;
  const [livePrice, setLivePrice] = useState(market.base);
  const [prevTick, setPrevTick] = useState(market.base);
  const [animKey, setAnimKey] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (onPriceChange) {
      onPriceChange(livePrice);
    }
  }, [livePrice, onPriceChange]);

  // Fetch prices from DB/API
  const fetchPrices = async (targetMarketId: string) => {
    try {
      const res = await fetch(`/api/prices?market=${targetMarketId}`);
      const data = await res.json();
      if (data.success && data.series) {
        setChartData(data.series);
        // Find Kini (today) price
        const kini = data.series.find((s: any) => s.label === "Kini") || [...data.series].reverse().find((s: any) => s.v !== null);
        const baseVal = kini ? (kini.v || kini.f) : market.base;
        setLivePrice(baseVal);
        setPrevTick(baseVal);
      }
    } catch (err) {
      console.error("Gagal mengambil data harga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPrices(marketId);
    setAnimKey((k) => k + 1);
  }, [marketId]);

  // Handle manual scraping/syncing

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Mensinkronkan data harga telur ayam dari Sun Egg...");
    try {
      const res = await fetch("/api/scrape-prices", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Sinkronisasi harga berhasil!", { id: toastId });
        await fetchPrices(marketId);
        setAnimKey((k) => k + 1);
      } else {
        toast.error(data.error || "Gagal menyelaraskan harga.", { id: toastId });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat sinkronisasi.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  // Yesterday price
  const yesterday = useMemo(() => {
    const entry = chartData.find((s) => s.label === "Kemarin");
    return entry ? entry.v : (market.base - 250);
  }, [chartData, market.base]);

  const today = livePrice;

  // Trend comparison to yesterday
  const trend = today - yesterday;
  const pct = yesterday > 0 ? (trend / yesterday) * 100 : 0;

  const tomorrow = useMemo(() => {
    const entry = chartData.find((s) => s.label === "Besok");
    return entry ? entry.f : Math.round(today + (today - yesterday) * 1.3 + 180);
  }, [chartData, today, yesterday]);

  // Date labels for each box
  const dateLabels = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const nowD = new Date();
    const yestD = new Date(nowD); yestD.setDate(nowD.getDate() - 1);
    const tomD = new Date(nowD); tomD.setDate(nowD.getDate() + 1);
    // Try to get date from chartData for accuracy
    const kemarinEntry = chartData.find((s) => s.label === "Kemarin");
    const kiniEntry = chartData.find((s) => s.label === "Kini");
    const besokEntry = chartData.find((s) => s.label === "Besok");
    return {
      kemarin: kemarinEntry?.date ? fmt(new Date(kemarinEntry.date + "T00:00:00")) : fmt(yestD),
      kini: kiniEntry?.date ? fmt(new Date(kiniEntry.date + "T00:00:00")) : fmt(nowD),
      besok: besokEntry?.date ? fmt(new Date(besokEntry.date + "T00:00:00")) : fmt(tomD),
    };
  }, [chartData]);


  const highestPoint = useMemo(() => {
    if (chartData.length === 0) return { v: livePrice + 350, label: "—" };
    return chartData.reduce((prev, current) => {
      const vPrev = prev.v || prev.f || 0;
      const vCurr = current.v || current.f || 0;
      return (vCurr > vPrev) ? current : prev;
    }, chartData[0]);
  }, [chartData, livePrice]);

  const lowestPoint = useMemo(() => {
    if (chartData.length === 0) return { v: livePrice - 250, label: "—" };
    const validData = chartData.filter(d => (d.v || d.f || 0) > 0);
    if (validData.length === 0) return { v: livePrice - 250, label: "—" };
    return validData.reduce((prev, current) => {
      const vPrev = prev.v || prev.f || 0;
      const vCurr = current.v || current.f || 0;
      return (vCurr < vPrev) ? current : prev;
    }, validData[0]);
  }, [chartData, livePrice]);

  const dailySeries = useMemo(() => {
    if (chartData.length > 0) {
      // Tampilkan seluruh riwayat hingga 30 hari terakhir untuk mencocokkan tren SunEgg
      const data = chartData.slice(-30);
      return data.map((item) => ({
        label: item.label,
        v: item.v,
        f: item.label === "Kini" ? item.v : item.f,
      }));
    }

    // Static fallback while loading
    return [
      { label: "−6h", v: market.base - 600, f: null as number | null },
      { label: "−5h", v: market.base - 480, f: null },
      { label: "−4h", v: market.base - 350, f: null },
      { label: "−3h", v: market.base - 280, f: null },
      { label: "Lusa", v: market.base - 320, f: null },
      { label: "Kemarin", v: yesterday, f: null },
      { label: "Kini", v: today, f: today },
      { label: "Besok", v: null, f: tomorrow },
    ];
  }, [chartData, market.base, yesterday, today, tomorrow]);

  const sparkData = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ t: i, v: livePrice + Math.sin(i / 2 + livePrice / 800) * 120 })),
    [livePrice]
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: false, margin: "-60px" });

  return (
    <section id="harga" className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        <FadeIn><SectionLabel n="02" label="Indeks Harga Telur — per kg" /></FadeIn>

        {/* Market selector */}
        <FadeIn delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
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

            {/* Sync button */}
            <motion.button
              onClick={handleSync}
              disabled={syncing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-sm border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-accent transition hover:bg-accent/20 disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Mensinkronkan..." : "Sinkronkan Harga"}
            </motion.button>
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

              <div className="mt-4 rounded-md border border-border/50 bg-secondary/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">💡 Info Prediksi:</span> Nilai prediksi besok dihitung dengan melihat selisih kenaikan/penurunan harga hari ini vs kemarin, ditambah faktor momentum +10% untuk membaca arah pasar jangka pendek.
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
                <dt className="uppercase tracking-[0.16em] text-muted-foreground flex items-center">Tertinggi</dt>
                <dd className="text-right flex flex-col items-end">
                   <span>{formatRp(highestPoint.v || highestPoint.f || 0)}</span>
                   <span className="text-[9px] text-muted-foreground/70">{highestPoint.label}</span>
                </dd>
                <dt className="uppercase tracking-[0.16em] text-muted-foreground flex items-center">Terendah</dt>
                <dd className="text-right flex flex-col items-end">
                   <span>{formatRp(lowestPoint.v || lowestPoint.f || 0)}</span>
                   <span className="text-[9px] text-muted-foreground/70">{lowestPoint.label}</span>
                </dd>
                <dt className="uppercase tracking-[0.16em] text-muted-foreground">Volume</dt>
                <dd className="text-right">8.4k butir</dd>
                <dt className="uppercase tracking-[0.16em] text-muted-foreground">Pembaruan</dt>
                <dd className="text-right">{loading ? "loading..." : "tiap 3 dtk"}</dd>
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
                  <div className="mt-1.5 font-mono text-[10px] text-muted-foreground/60">{dateLabels.kemarin}</div>
                </div>

                {/* Harga Kini */}
                <div className="relative overflow-hidden bg-card p-5 ring-2 ring-inset ring-accent/40">
                  <motion.div
                    className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-accent"
                    animate={{ opacity: [0.15, 0.55, 0.15] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
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
                  <div className="relative mt-1.5 font-mono text-[10px] text-muted-foreground/60">{dateLabels.kini}</div>
                </div>

                {/* Prediksi Besok */}
                <div className="relative overflow-hidden bg-card p-5">
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                    animate={{ x: ["-100%", "500%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
                  />
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
                  <div className="relative mt-1.5 font-mono text-[10px] text-accent/50">{dateLabels.besok}</div>
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
                <div className="relative h-80 md:h-96" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySeries} margin={{ top: 24, right: 20, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "#6b5f4a" }} axisLine={{ stroke: "rgba(0,0,0,0.15)" }} tickLine={false} interval={Math.max(0, Math.floor(dailySeries.length / 8) - 1)} angle={-35} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono", fill: "#6b5f4a" }} axisLine={false} tickLine={false} domain={["dataMin - 400", "dataMax + 400"]} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} width={44} />
                      <Tooltip contentStyle={{ background: "#fbfaf6", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 2, fontFamily: "JetBrains Mono", fontSize: 11 }} formatter={(v) => (v ? formatRp(Number(v)) : "—")} />
                      <ReferenceLine x="Kini" stroke="#e8a838" strokeDasharray="2 3" label={{ value: "sekarang", position: "insideTopRight", fill: "#6b5f4a", fontSize: 10, fontFamily: "JetBrains Mono", offset: 10 }} />
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
                        dot={(dotProps: Record<string, unknown>) => {
                          const payload = dotProps.payload as { f: number | null; label: string };
                          if (payload.f === null || payload.f === undefined)
                            return <g key={`fp-${dotProps.index}`} />;
                          const { cx, cy, index } = dotProps as { cx: number; cy: number; index: number };
                          if (payload.label === "Besok") {
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
                  {/* Wipe animation curtains */}
                  <motion.div
                    key={animKey + "-wipe"}
                    className="pointer-events-none absolute inset-0 z-10 bg-card"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: chartInView ? 0 : 1 }}
                    transition={chartInView ? { duration: 1.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                    style={{ transformOrigin: "right" }}
                  />
                  <motion.div
                    key={animKey + "-wipe-pred"}
                    className="pointer-events-none absolute inset-y-0 z-10 bg-card"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: chartInView ? 0 : 1 }}
                    transition={chartInView ? { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 1.35 } : { duration: 0 }}
                    style={{ left: "calc(84% - 12px)", right: 0, transformOrigin: "right" }}
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
