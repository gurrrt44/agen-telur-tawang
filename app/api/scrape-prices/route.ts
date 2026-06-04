import { NextResponse } from "next/server";

interface PriceItem {
  province: string;
  alias: string;
  price: {
    value: number;
    currency: string;
    unit: string;
  };
}

interface RegionItem {
  region: string;
  region_list: PriceItem[];
}

interface SunEggPriceData {
  price_date: string;
  price_list: RegionItem[];
}

// Map SunEgg province names to local market IDs
const MARKET_MAPPING: Record<string, string> = {
  "Jombang":   "jombang",
  "Mojokerto": "mojokerto",
  "Kediri":    "kediri",
  "Blitar":    "blitar",
  "Malang":    "malang",
  "Surabaya":  "surabaya",
  "Sidoarjo":  "sidoarjo",
};

function extractMarketPrices(priceData: SunEggPriceData) {
  const dateStr = priceData.price_date.split("T")[0]; // "YYYY-MM-DD"
  const rows: { market_id: string; price: number; recorded_date: string }[] = [];

  for (const region of priceData.price_list) {
    for (const item of region.region_list) {
      const marketId = MARKET_MAPPING[item.province];
      if (marketId && item.price && typeof item.price.value === "number") {
        rows.push({
          market_id: marketId,
          price: item.price.value,
          recorded_date: dateStr,
        });
      }
    }
  }

  return rows;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  try {
    // 1. Fetch data from SunEgg public API
    const response = await fetch("https://sunegg.id/api/national-price", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `SunEgg API returned status ${response.status}` },
        { status: 500 }
      );
    }

    const json = await response.json();
    if (json.status !== 200 || !json.data) {
      return NextResponse.json(
        { success: false, error: "Invalid response structure from SunEgg API" },
        { status: 500 }
      );
    }

    const { today_price, yesterday_price } = json.data;
    const rowsToUpsert: { market_id: string; price: number; recorded_date: string }[] = [];

    if (today_price) {
      rowsToUpsert.push(...extractMarketPrices(today_price));
    }
    if (yesterday_price) {
      rowsToUpsert.push(...extractMarketPrices(yesterday_price));
    }

    if (rowsToUpsert.length === 0) {
      return NextResponse.json(
        { success: false, error: "No target market prices found in SunEgg API data" },
        { status: 400 }
      );
    }

    // 2. Cek apakah Supabase sudah dikonfigurasi
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "Supabase belum dikonfigurasi. Scraping sukses (Demo Mode).",
        scrapedData: rowsToUpsert,
      });
    }

    // 3. Upsert ke Supabase via REST API langsung (lebih reliable di Vercel serverless)
    const restUrl = `${supabaseUrl}/rest/v1/price_history?on_conflict=market_id,recorded_date`;

    const upsertRes = await fetch(restUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify(rowsToUpsert),
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.error("Supabase REST upsert error:", upsertRes.status, errText);
      return NextResponse.json(
        {
          success: false,
          error: `Supabase REST error ${upsertRes.status}: ${errText}`,
          scrapedData: rowsToUpsert,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sukses mensinkronisasikan harga dari SunEgg ke Supabase!",
      insertedCount: rowsToUpsert.length,
      data: rowsToUpsert,
    });

  } catch (error: any) {
    console.error("Scraping handler error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
