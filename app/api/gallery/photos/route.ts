import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admintawang";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  // Gunakan service role jika ada untuk operasi write admin, jika tidak fallback ke anon key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  return {
    url,
    adminKey: serviceKey || anonKey,
    anonKey,
  };
}

// GET: Mengambil foto galeri
export async function GET(request: NextRequest) {
  const { url, adminKey, anonKey } = getSupabaseConfig();
  if (!url) {
    return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });
  }

  const passwordHeader = request.headers.get("x-admin-password");
  const isAdmin = passwordHeader === ADMIN_PASSWORD;

  // Jika admin, gunakan adminKey untuk menarik semua foto (pending + approved)
  // Jika pengunjung biasa, hanya tarik yang approved=true
  const keyToUse = isAdmin ? adminKey : anonKey;
  const filter = isAdmin ? "" : "?approved=eq.true";
  const separator = filter ? "&" : "?";
  
  try {
    const res = await fetch(`${url}/rest/v1/gallery_photos${filter}${separator}order=created_at.desc`, {
      headers: {
        "apikey": keyToUse,
        "Authorization": `Bearer ${keyToUse}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, photos: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Pengunjung mengunggah foto baru (pending)
export async function POST(request: NextRequest) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url) {
    return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { image_url, caption, submitter_name } = body;

    if (!image_url) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/gallery_photos`, {
      method: "POST",
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        image_url,
        caption: caption || "",
        submitter_name: submitter_name || "Anonim",
        approved: false, // Selalu default ke false untuk persetujuan admin
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, photo: data[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Admin menyetujui / membatalkan persetujuan foto
export async function PUT(request: NextRequest) {
  const { url, adminKey } = getSupabaseConfig();
  if (!url) {
    return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });
  }

  // Verifikasi password admin
  const passwordHeader = request.headers.get("x-admin-password");
  if (passwordHeader !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, approved } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Photo ID is required" }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/gallery_photos?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "apikey": adminKey,
        "Authorization": `Bearer ${adminKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ approved }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Admin menghapus foto
export async function DELETE(request: NextRequest) {
  const { url, adminKey } = getSupabaseConfig();
  if (!url) {
    return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });
  }

  // Verifikasi password admin
  const passwordHeader = request.headers.get("x-admin-password");
  if (passwordHeader !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Photo ID is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/gallery_photos?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": adminKey,
        "Authorization": `Bearer ${adminKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
