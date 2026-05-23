import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  try {
    // 1. Fetch data from SunEgg public API
    const response = await fetch("https://sunegg.id/api/national-price", {
      cache: "no-store", // Jangan gunakan cache agar data selalu ter-update
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
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

    // Extract prices from today
    if (today_price) {
      rowsToUpsert.push(...extractMarketPrices(today_price));
    }

    // Extract prices from yesterday
    if (yesterday_price) {
      rowsToUpsert.push(...extractMarketPrices(yesterday_price));
    }

    if (rowsToUpsert.length === 0) {
      return NextResponse.json(
        { success: false, error: "No target market prices found in SunEgg API data" },
        { status: 400 }
      );
    }

    // 2. Save to Supabase (if configured)
    if (!supabase) {
      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "Supabase belum dikonfigurasi. Scraping sukses (Demo Mode).",
        scrapedData: rowsToUpsert,
      });
    }

    const { error } = await supabase
      .from("price_history")
      .upsert(rowsToUpsert, { onConflict: "market_id,recorded_date" });

    if (error) {
      console.error("Error upserting prices to Supabase:", error);
      return NextResponse.json(
        { success: false, error: `Supabase error: ${error.message}`, scrapedData: rowsToUpsert },
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
