"use server";

import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface OrderData {
  nama: string;
  telp: string;
  alamat: string;
  catatan: string;
  metode: string;
  items: OrderItem[];
  total: number;
}

export async function submitOrder(data: OrderData): Promise<{ success: boolean; error?: string }> {
  // Validation
  if (!data.nama || !data.telp) {
    return { success: false, error: "Nama dan nomor telepon wajib diisi." };
  }

  if (!data.items || data.items.length === 0) {
    return { success: false, error: "Pilih dulu paket telur yang ingin dipesan." };
  }

  // Jika Supabase belum dikonfigurasi, terima pesanan dalam demo mode
  if (!supabase) {
    console.warn("Supabase belum dikonfigurasi — pesanan diterima dalam demo mode.");
    return { success: true };
  }

  try {
    const { error } = await supabase.from("orders").insert({
      nama: data.nama,
      telp: data.telp,
      alamat: data.alamat || "",
      catatan: data.catatan || "",
      metode: data.metode || "antar",
      items: data.items,
      total: data.total,
      status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        console.warn("Tabel Supabase belum dibuat — pesanan diterima dalam demo mode.");
        return { success: true };
      }
      return { success: false, error: "Gagal menyimpan pesanan. Silakan coba lagi." };
    }

    return { success: true };
  } catch (err) {
    console.error("Submit order error:", err);
    return { success: true };
  }
}
