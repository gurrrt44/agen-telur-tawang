import { NextRequest, NextResponse } from "next/server";
import { MARKETS } from "@/lib/data";

// Helper to format date as "D MMM" (e.g., "23 Mei")
function formatDateLabel(dateStr: string) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

// Get today/yesterday string in WIB timezone
function getWIBDateStr(offsetDays = 0) {
  const wibFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });
  return wibFormatter.format(new Date(Date.now() + offsetDays * 86400000));
}

// Generate fallback / demo historical data if DB is empty
function generateFallbackData(marketId: string) {
  const market = MARKETS.find(m => m.id === marketId) || MARKETS[0];
  const basePrice = market.base;

  const today = new Date();
  const series = [];

  for (let i = 5; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const randomShift = Math.sin(i * 1.5) * 400 - (i * 150);
    const price = Math.round((basePrice + randomShift) / 100) * 100;

    series.push({
      label: formatDateLabel(dateStr),
      v: price,
      f: null as number | null,
      date: dateStr,
    });
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(today.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
  const yesterdayPrice = basePrice - 200;
  series.push({ label: "Kemarin", v: yesterdayPrice, f: null, date: yesterdayStr });

  const todayStr = today.toISOString().split("T")[0];
  series.push({ label: "Kini", v: basePrice, f: basePrice, date: todayStr });

  const tomorrowDate = new Date();
  tomorrowDate.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
  const tomorrowPrice = Math.round(basePrice + (basePrice - yesterdayPrice) * 1.2 + 100);
  series.push({ label: "Besok", v: null, f: tomorrowPrice, date: tomorrowStr });

  return series;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const marketId = searchParams.get("market") || "jombang";

  const market = MARKETS.find(m => m.id === marketId);
  if (!market) {
    return NextResponse.json({ success: false, error: "Market not found" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Jika Supabase tidak dikonfigurasi, langsung return fallback
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: true,
      demoMode: true,
      series: generateFallbackData(marketId),
    });
  }

  try {
    // Fetch dari Supabase via REST API langsung
    const params = new URLSearchParams({
      market_id: `eq.${marketId}`,
      order: "recorded_date.desc",
      limit: "30",
      select: "price,recorded_date",
    });

    const res = await fetch(`${supabaseUrl}/rest/v1/price_history?${params}`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase REST fetch error:", res.status, errText);
      return NextResponse.json({
        success: true,
        error: `Supabase fetch error ${res.status}`,
        series: generateFallbackData(marketId),
      });
    }

    let records: { price: number; recorded_date: string }[] = await res.json();

    // Jika belum ada data, bootstrap dengan scraping
    if (!records || records.length === 0) {
      console.log(`No records for ${marketId}. Bootstrapping from SunEgg...`);
      try {
        const protocol = request.nextUrl.protocol;
        const host = request.nextUrl.host;
        const scrapeRes = await fetch(`${protocol}//${host}/api/scrape-prices`, { cache: "no-store" });
        if (scrapeRes.ok) {
          // Re-fetch setelah scraping
          const res2 = await fetch(`${supabaseUrl}/rest/v1/price_history?${params}`, {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Accept": "application/json",
            },
            cache: "no-store",
          });
          if (res2.ok) {
            const newRecords = await res2.json();
            if (newRecords && newRecords.length > 0) {
              records = newRecords;
            }
          }
        }
      } catch (scrapeErr) {
        console.error("Failed to bootstrap pricing data:", scrapeErr);
      }
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No data available. Showing demo prices.",
        series: generateFallbackData(marketId),
      });
    }

    // Sort ascending
    records.sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());

    // Gunakan timezone WIB (Asia/Jakarta) agar tanggal sesuai dengan update SunEgg
    const wibFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });
    const todayStr = wibFormatter.format(new Date());
    const yesterdayStr = wibFormatter.format(new Date(Date.now() - 86400000));

    const series: { label: string; v: number | null; f: number | null; date: string }[] = records.map((record) => {
      const isToday = record.recorded_date === todayStr;
      const isYesterday = record.recorded_date === yesterdayStr;
      let label = formatDateLabel(record.recorded_date);
      if (isToday) label = "Kini";
      else if (isYesterday) label = "Kemarin";

      return {
        label,
        v: record.price as number | null,
        f: isToday ? record.price : null,
        date: record.recorded_date,
      };
    });

    // Prediksi besok
    const todayEntry = series.find(s => s.date === todayStr);
    const yesterdayEntry = series.find(s => s.date === yesterdayStr);

    if (todayEntry) {
      const todayPrice = todayEntry.v as number;
      const yesterdayPrice = yesterdayEntry ? (yesterdayEntry.v as number) : (todayPrice - 100);
      const predictedTomorrow = Math.round(todayPrice + (todayPrice - yesterdayPrice) * 1.1);
      series.push({
        label: "Besok",
        v: null,
        f: predictedTomorrow,
        date: getWIBDateStr(1),
      });
    } else {
      const lastEntry = series[series.length - 1];
      const secondLastEntry = series[series.length - 2];
      const lastPrice = lastEntry.v as number;
      const secondLastPrice = secondLastEntry ? (secondLastEntry.v as number) : (lastPrice - 100);
      const predictedToday = Math.round(lastPrice + (lastPrice - secondLastPrice) * 1.1);
      series.push({ label: "Kini", v: null, f: predictedToday, date: todayStr });
    }

    return NextResponse.json({ success: true, series });

  } catch (error: any) {
    console.error("GET prices handler error:", error);
    return NextResponse.json({
      success: true,
      error: error.message,
      series: generateFallbackData(marketId),
    });
  }
}
