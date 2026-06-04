import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admintawang";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  return {
    url,
    adminKey: serviceKey || anonKey,
    anonKey,
  };
}

/** Ekstrak path storage dari image_url (mendukung pending/ maupun root) */
function extractStoragePath(imageUrl: string, supabaseUrl: string): string | null {
  // Format: https://<project>.supabase.co/storage/v1/object/public/gallery/<path>
  const prefix = `${supabaseUrl}/storage/v1/object/public/gallery/`;
  if (imageUrl.startsWith(prefix)) {
    return imageUrl.replace(prefix, ""); // misal "pending/filename.jpg" atau "filename.jpg"
  }
  return null;
}

/** Hapus file dari Supabase Storage */
async function deleteFromStorage(supabaseUrl: string, adminKey: string, storagePath: string) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/gallery/${storagePath}`, {
    method: "DELETE",
    headers: {
      "apikey": adminKey,
      "Authorization": `Bearer ${adminKey}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Gagal hapus storage [${storagePath}]:`, err);
  }
}

// ─────────────────────────────────────────────
// GET: Ambil foto galeri
// ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { url, adminKey, anonKey } = getSupabaseConfig();
  if (!url) return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });

  const passwordHeader = request.headers.get("x-admin-password");
  const isAdmin = passwordHeader === ADMIN_PASSWORD;

  // Admin: semua foto (pending + approved). Pengunjung: hanya approved=true
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

// ─────────────────────────────────────────────
// POST: Pengunjung upload foto (simpan sementara di pending/)
// File disimpan di gallery/pending/<filename> sampai admin setujui.
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { url, adminKey } = getSupabaseConfig();
  if (!url) return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });

  try {
    const contentType = request.headers.get("content-type") || "";
    let imageUrl = "";
    let caption = "";
    let submitterName = "";
    let label = "Puas";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      caption = (formData.get("caption") as string) || "";
      submitterName = (formData.get("submitter_name") as string) || "Anonim";
      label = (formData.get("label") as string) || "Puas";

      if (!file) {
        return NextResponse.json({ success: false, error: "File gambar harus disertakan" }, { status: 400 });
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // ✅ Upload ke folder pending/ — belum masuk galeri publik
      const uploadRes = await fetch(`${url}/storage/v1/object/gallery/pending/${fileName}`, {
        method: "POST",
        headers: {
          "apikey": adminKey,
          "Authorization": `Bearer ${adminKey}`,
          "Content-Type": file.type,
        },
        body: fileBuffer,
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.text();
        return NextResponse.json(
          { success: false, error: `Gagal mengunggah file ke Storage: ${uploadErr}` },
          { status: uploadRes.status }
        );
      }

      // URL sementara — mengarah ke pending/
      imageUrl = `${url}/storage/v1/object/public/gallery/pending/${fileName}`;
    } else {
      // Fallback JSON payload
      const body = await request.json();
      imageUrl = body.image_url;
      caption = body.caption || "";
      submitterName = body.submitter_name || "Anonim";
      label = body.label || "Puas";

      if (!imageUrl) {
        return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
      }
    }

    // Simpan record ke DB dengan approved=false
    const res = await fetch(`${url}/rest/v1/gallery_photos`, {
      method: "POST",
      headers: {
        "apikey": adminKey,
        "Authorization": `Bearer ${adminKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        submitter_name: submitterName,
        label,
        approved: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      // Kalau DB gagal, hapus file yang sudah terupload
      const storagePath = extractStoragePath(imageUrl, url);
      if (storagePath) await deleteFromStorage(url, adminKey, storagePath);
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, photo: data[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// PUT: Admin perbarui / setujui / edit data foto
// Saat approve: file dipindah dari pending/ ke root gallery/
// ─────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const { url, adminKey } = getSupabaseConfig();
  if (!url) return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });

  const passwordHeader = request.headers.get("x-admin-password");
  if (passwordHeader !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, approved, caption, submitter_name, label } = body;

    if (!id) return NextResponse.json({ success: false, error: "Photo ID is required" }, { status: 400 });

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (submitter_name !== undefined) updateData.submitter_name = submitter_name;
    if (label !== undefined) updateData.label = label;

    // ✅ Jika admin menyetujui foto: pindahkan file dari pending/ ke root gallery/
    if (approved === true) {
      // Ambil data foto dulu untuk mendapat image_url saat ini
      const getRes = await fetch(`${url}/rest/v1/gallery_photos?id=eq.${id}&select=id,image_url`, {
        headers: {
          "apikey": adminKey,
          "Authorization": `Bearer ${adminKey}`,
          "Accept": "application/json",
        },
      });

      if (getRes.ok) {
        const photos = await getRes.json();
        const photo = photos?.[0];

        if (photo?.image_url) {
          const storagePath = extractStoragePath(photo.image_url, url);

          // Hanya proses jika masih di pending/
          if (storagePath?.startsWith("pending/")) {
            const fileName = storagePath.replace("pending/", "");

            // Download file dari pending/
            const downloadRes = await fetch(`${url}/storage/v1/object/gallery/${storagePath}`, {
              headers: {
                "apikey": adminKey,
                "Authorization": `Bearer ${adminKey}`,
              },
            });

            if (downloadRes.ok) {
              const fileBuffer = await downloadRes.arrayBuffer();
              const contentType = downloadRes.headers.get("content-type") || "image/jpeg";

              // Upload ke root gallery/ (permanen)
              const uploadRes = await fetch(`${url}/storage/v1/object/gallery/${fileName}`, {
                method: "POST",
                headers: {
                  "apikey": adminKey,
                  "Authorization": `Bearer ${adminKey}`,
                  "Content-Type": contentType,
                },
                body: fileBuffer,
              });

              if (uploadRes.ok) {
                // Update image_url di DB ke lokasi permanen
                updateData.image_url = `${url}/storage/v1/object/public/gallery/${fileName}`;
                // Hapus file pending/ setelah berhasil dipindah
                await deleteFromStorage(url, adminKey, storagePath);
              } else {
                const uploadErr = await uploadRes.text();
                console.error("Gagal memindah file ke root gallery:", uploadErr);
              }
            }
          }
        }
      }

      updateData.approved = true;
    } else if (approved === false) {
      updateData.approved = false;
    }

    const res = await fetch(`${url}/rest/v1/gallery_photos?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "apikey": adminKey,
        "Authorization": `Bearer ${adminKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
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

// ─────────────────────────────────────────────
// DELETE: Admin hapus foto (DB + Storage, pending maupun approved)
// ─────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { url, adminKey } = getSupabaseConfig();
  if (!url) return NextResponse.json({ success: false, error: "Supabase URL not configured" }, { status: 500 });

  const passwordHeader = request.headers.get("x-admin-password");
  if (passwordHeader !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Photo ID is required" }, { status: 400 });

  try {
    // 1. Ambil image_url dari DB
    const getRes = await fetch(`${url}/rest/v1/gallery_photos?id=eq.${id}&select=id,image_url`, {
      headers: {
        "apikey": adminKey,
        "Authorization": `Bearer ${adminKey}`,
        "Accept": "application/json",
      },
    });

    if (getRes.ok) {
      const photos = await getRes.json();
      const photo = photos?.[0];

      // 2. Hapus file dari storage (pending/ maupun root)
      if (photo?.image_url) {
        const storagePath = extractStoragePath(photo.image_url, url);
        if (storagePath) {
          await deleteFromStorage(url, adminKey, storagePath);
        }
      }
    }

    // 3. Hapus record dari DB
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
