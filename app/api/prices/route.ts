import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

// Generate fallback / demo historical data if DB is empty
function generateFallbackData(marketId: string) {
  const market = MARKETS.find(m => m.id === marketId) || MARKETS[0];
  const basePrice = market.base;

  // Let's generate 6 days of history + today + tomorrow
  const today = new Date();
  const series = [];

  for (let i = 5; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Create minor fluctuations around base price
    const randomShift = Math.sin(i * 1.5) * 400 - (i * 150);
    const price = Math.round((basePrice + randomShift) / 100) * 100;

    series.push({
      label: formatDateLabel(dateStr),
      v: price,
      f: null as number | null,
      date: dateStr,
    });
  }

  // Yesterday
  const yesterdayDate = new Date();
  yesterdayDate.setDate(today.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
  const yesterdayPrice = basePrice - 200;
  series.push({
    label: "Kemarin",
    v: yesterdayPrice,
    f: null,
    date: yesterdayStr,
  });

  // Today (Kini)
  const todayStr = today.toISOString().split("T")[0];
  const todayPrice = basePrice;
  series.push({
    label: "Kini",
    v: todayPrice,
    f: todayPrice,
    date: todayStr,
  });

  // Tomorrow (Besok - Prediction)
  const tomorrowDate = new Date();
  tomorrowDate.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
  const tomorrowPrice = Math.round(todayPrice + (todayPrice - yesterdayPrice) * 1.2 + 100);
  series.push({
    label: "Besok",
    v: null,
    f: tomorrowPrice,
    date: tomorrowStr,
  });

  return series;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const marketId = searchParams.get("market") || "jombang";


  const market = MARKETS.find(m => m.id === marketId);
  if (!market) {
    return NextResponse.json({ success: false, error: "Market not found" }, { status: 400 });
  }

  // 1. If Supabase is not configured, return generated fallback immediately
  if (!supabase) {
    return NextResponse.json({
      success: true,
      demoMode: true,
      series: generateFallbackData(marketId),
    });
  }

  try {
    // 2. Fetch last 10 historical records from Supabase
    let { data: records, error } = await supabase
      .from("price_history")
      .select("price, recorded_date")
      .eq("market_id", marketId)
      .order("recorded_date", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({
        success: true,
        error: error.message,
        series: generateFallbackData(marketId),
      });
    }

    // 3. If no records exist, trigger an automatic scrape to bootstrap the DB
    if (!records || records.length === 0) {
      console.log(`No records found for ${marketId}. Bootstrapping database from SunEgg...`);
      try {
        const protocol = request.nextUrl.protocol;
        const host = request.nextUrl.host;
        // Call local scrape API endpoint internally
        const scrapeRes = await fetch(`${protocol}//${host}/api/scrape-prices`, { cache: "no-store" });
        if (scrapeRes.ok) {
          // Re-fetch records after scraping
          const { data: newRecords } = await supabase
            .from("price_history")
            .select("price, recorded_date")
            .eq("market_id", marketId)
            .order("recorded_date", { ascending: false })
            .limit(30);
          
          if (newRecords && newRecords.length > 0) {
            records = newRecords;
          }
        }
      } catch (scrapeErr) {
        console.error("Failed to automatically bootstrap pricing data:", scrapeErr);
      }
    }

    // 4. If we still don't have records (e.g. scraping returned nothing for this market or failed),
    // return graceful generated fallback
    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No data available in database. Showing demo prices.",
        series: generateFallbackData(marketId),
      });
    }

    // Sort chronologically (ascending recorded_date)
    records.sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());

    // 5. Structure data for the chart
    const series = [];
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Add historical entries
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isToday = record.recorded_date === todayStr;
      const isYesterday = record.recorded_date === yesterdayStr;

      let label = formatDateLabel(record.recorded_date);
      if (isToday) label = "Kini";
      else if (isYesterday) label = "Kemarin";

      series.push({
        label,
        v: record.price,
        f: isToday ? record.price : null,
        date: record.recorded_date,
      });
    }

    // If today's price is present, predict tomorrow's price!
    const todayEntry = series.find(s => s.date === todayStr);
    const yesterdayEntry = series.find(s => s.date === yesterdayStr);

    if (todayEntry) {
      const todayPrice = todayEntry.v;
      const yesterdayPrice = yesterdayEntry ? yesterdayEntry.v : (todayPrice - 100);
      const predictedTomorrow = Math.round(todayPrice + (todayPrice - yesterdayPrice) * 1.1 + 50);

      series.push({
        label: "Besok",
        v: null,
        f: predictedTomorrow,
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      });
    } else {
      // If today's price is not scraped yet, predict it based on last entry
      const lastEntry = series[series.length - 1];
      const secondLastEntry = series[series.length - 2];
      
      const lastPrice = lastEntry.v as number;
      const secondLastPrice = secondLastEntry ? (secondLastEntry.v as number) : (lastPrice - 100);
      const predictedToday = Math.round(lastPrice + (lastPrice - secondLastPrice) * 1.1 + 50);

      series.push({
        label: "Kini",
        v: null,
        f: predictedToday,
        date: todayStr,
      });
    }

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (error: any) {
    console.error("GET prices handler error:", error);
    return NextResponse.json({
      success: true,
      error: error.message,
      series: generateFallbackData(marketId),
    });
  }
}
