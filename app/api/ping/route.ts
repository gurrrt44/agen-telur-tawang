import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
  }

  const results: Record<string, unknown> = { pinged_at: new Date().toISOString() };

  try {
    // 1. Ping Supabase agar tidak pause (query ringan)
    const pingRes = await fetch(`${supabaseUrl}/rest/v1/price_history?limit=1&select=market_id`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    results.supabase_ping = pingRes.ok ? "ok" : `error ${pingRes.status}`;

    // 2. Auto-sync harga terbaru dari SunEgg ke Supabase
    const protocol = request.nextUrl.protocol;
    const host = request.nextUrl.host;
    const scrapeRes = await fetch(`${protocol}//${host}/api/scrape-prices`, { cache: "no-store" });
    const scrapeData = await scrapeRes.json();
    results.scrape_success = scrapeData.success;
    results.scrape_message = scrapeData.message || scrapeData.error;
    results.inserted_count = scrapeData.insertedCount;

    return NextResponse.json({ ok: true, ...results });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, ...results }, { status: 500 });
  }
}