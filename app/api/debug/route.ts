import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

  const result: Record<string, unknown> = {
    supabaseUrl_length: supabaseUrl.length,
    supabaseUrl_prefix: supabaseUrl.slice(0, 30),
    supabaseKey_length: supabaseKey.length,
    supabaseKey_prefix: supabaseKey.slice(0, 20),
    configured: !!(supabaseUrl && supabaseKey),
  };

  // Test koneksi ke Supabase REST API
  if (supabaseUrl && supabaseKey) {
    try {
      const testRes = await fetch(`${supabaseUrl}/rest/v1/price_history?limit=1&select=market_id`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Accept": "application/json",
        },
        cache: "no-store",
      });
      result.supabase_status = testRes.status;
      result.supabase_ok = testRes.ok;
      const body = await testRes.text();
      result.supabase_response = body.slice(0, 200);
    } catch (e: any) {
      result.supabase_error = e.message;
    }
  }

  // Test koneksi ke SunEgg
  try {
    const sunRes = await fetch("https://sunegg.id/api/national-price", {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    result.sunegg_status = sunRes.status;
    result.sunegg_ok = sunRes.ok;
  } catch (e: any) {
    result.sunegg_error = e.message;
  }

  return NextResponse.json(result);
}
