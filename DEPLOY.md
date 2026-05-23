# 🚀 Panduan Deploy: Agen Telur Tawang

Deploy website ini **100% gratis** menggunakan **Supabase** (database) + **Vercel** (hosting).

---

## 1. Setup Supabase (Database Gratis)

### Buat Akun & Project
1. Buka [supabase.com](https://supabase.com) → **Start your project** → daftar dengan GitHub
2. Klik **New Project**
3. Isi:
   - **Name**: `telur-sari-tani`
   - **Database Password**: (buat password, simpan baik-baik)
   - **Region**: `Southeast Asia (Singapore)`
4. Klik **Create new project** → tunggu selesai (± 2 menit)

### Jalankan SQL Schema
1. Di dashboard Supabase, buka **SQL Editor** (menu kiri)
2. Klik **New Query**
3. Copy-paste seluruh isi file [`lib/supabase-schema.sql`](./lib/supabase-schema.sql)
4. Klik **Run** → pastikan berhasil (tidak ada error)

### Ambil API Keys
1. Buka **Settings** → **API**
2. Copy dua value ini:
   - **Project URL** → contoh: `https://abcdefgh.supabase.co`
   - **anon public key** → contoh: `eyJhbGci...` (yang panjang)

### Update `.env.local`
Edit file `.env.local` di root project:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 2. Push ke GitHub

```bash
git add .
git commit -m "Website Agen Telur Tawang - ready for deployment"
git remote add origin https://github.com/USERNAME/agen-telur-tawang.git
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub Anda.

---

## 3. Deploy ke Vercel (Hosting Gratis)

### Import Project
1. Buka [vercel.com](https://vercel.com) → **Sign Up** dengan GitHub
2. Klik **Add New** → **Project**
3. Pilih repository `agen-telur-tawang` → **Import**

### Set Environment Variables
Di halaman konfigurasi, tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase Anda |

### Deploy!
1. Klik **Deploy** → tunggu build selesai (± 1-2 menit)
2. Website Anda live di `https://agen-telur-tawang.vercel.app` 🎉

---

## 4. Custom Domain (Opsional)

Jika Anda punya domain sendiri:
1. Di Vercel, buka **Settings** → **Domains**
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel

---

## Free Tier Limits

| Service | Limit Gratis |
|---------|-------------|
| **Vercel** | Unlimited deployments, 100GB bandwidth/bulan |
| **Supabase** | 500MB database, 1GB file storage, 50k auth users |

Untuk website penjualan telur skala kecil-menengah, free tier ini **lebih dari cukup**.

---

## Troubleshooting

### Build Error
```bash
npm run build
```
Jika ada error, pastikan:
- Node.js versi 18+ terinstall
- Semua dependencies terinstall (`npm install`)

### Supabase Connection Error
- Cek `.env.local` sudah diisi dengan benar
- Pastikan tabel `orders` sudah dibuat (jalankan SQL schema)
- Website tetap berfungsi tanpa Supabase (demo mode)

### Gambar Tidak Muncul
- Pastikan `next.config.ts` sudah ada konfigurasi `images.remotePatterns`
- Cek koneksi internet (gambar dari Unsplash)
