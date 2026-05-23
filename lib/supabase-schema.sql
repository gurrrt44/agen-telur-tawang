-- ============================================
-- Agen Telur Tawang — Supabase Database Schema
-- ============================================
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================

-- 1. Tabel orders — menyimpan semua pesanan
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  telp TEXT NOT NULL,
  alamat TEXT DEFAULT '',
  catatan TEXT DEFAULT '',
  metode TEXT NOT NULL DEFAULT 'antar' CHECK (metode IN ('antar', 'ambil')),
  items JSONB NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Policy: siapa saja boleh INSERT (untuk form pemesanan publik)
CREATE POLICY "Allow anonymous inserts"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Policy: hanya authenticated users yang boleh SELECT (untuk admin nanti)
CREATE POLICY "Allow authenticated reads"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Index untuk query berdasarkan status dan waktu
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- ============================================
-- 6. Tabel price_history — untuk menyimpan riwayat harga real-time
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id TEXT NOT NULL,         -- 'klaten' | 'beringharjo' | 'gede'
  price INTEGER NOT NULL,          -- Harga per kg (Rupiah)
  recorded_date DATE NOT NULL,     -- Tanggal pencatatan (format: YYYY-MM-DD)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, recorded_date) -- Mencegah duplikasi harga pada pasar dan tanggal yang sama
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Siapa pun (anonim) diperbolehkan membaca data harga
CREATE POLICY "Allow public reads on price_history"
  ON price_history
  FOR SELECT
  TO anon
  USING (true);

-- Kebijakan: Siapa pun diperbolehkan melakukan INSERT/UPDATE (untuk API Route lokal)
CREATE POLICY "Allow service insert on price_history"
  ON price_history
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

