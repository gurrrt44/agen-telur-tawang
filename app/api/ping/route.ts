import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Verifikasi request dari Vercel Cron (keamanan)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Query ringan — cukup untuk jaga Supabase tetap aktif
        const { error } = await supabase.from("messages").select("id").limit(1);

        if (error) throw error;

        console.log("✅ Supabase ping berhasil:", new Date().toISOString());
        return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
    } catch (err) {
        console.error("❌ Ping gagal:", err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}