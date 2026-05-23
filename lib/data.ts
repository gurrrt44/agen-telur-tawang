export type Bundle = {
  id: string;
  name: string;
  weight: string;
  count: string;
  multiplier: number;
  basePrice: number;
  tag: string;
  note: string;
};

export const BUNDLES: Bundle[] = [
  { id: "qtr", name: "Paket Saku", weight: "Seperempat Kilo (¼ kg)", count: "± 4 butir", multiplier: 0.25, basePrice: 6000, tag: "Coba dulu", note: "Cocok untuk satu sarapan keluarga kecil." },
  { id: "half", name: "Paket Dapur", weight: "Setengah Kilo (½ kg)", count: "± 8 butir", multiplier: 0.5, basePrice: 12000, tag: "Sering dipesan", note: "Stok harian untuk masakan rumahan sederhana." },
  { id: "one", name: "Paket Rumah", weight: "Satu Kilo (1 kg)", count: "± 16 butir", multiplier: 1, basePrice: 24000, tag: "Favorit", note: "Pilihan paling laris — telur segar pilihan grade A." },
  { id: "tray", name: "Paket Tray", weight: "Satu Tray / Peti (± 1.8 kg)", count: "30 butir", multiplier: 1.8, basePrice: 43000, tag: "Hemat", note: "Disusun rapi dalam tray karton, aman untuk diantar." },
  { id: "warung", name: "Paket Warung", weight: "Lima Kilo (5 kg)", count: "± 80 butir", multiplier: 5, basePrice: 118000, tag: "Grosir", note: "Untuk warung, katering, atau bakery skala kecil." },
  { id: "resto", name: "Paket Resto", weight: "Sepuluh Kilo (10 kg)", count: "± 160 butir", multiplier: 10, basePrice: 235000, tag: "Langganan", note: "Pengiriman terjadwal, harga khusus mitra resto." },
];

export type Market = {
  id: string;
  name: string;
  city: string;
  base: number;
  coord: string;
};

export const MARKETS: Market[] = [
  { id: "jombang",   name: "Kota Jombang",   city: "Jombang",   base: 21600, coord: "−7.55° S · 112.23° E" },
  { id: "mojokerto", name: "Kota Mojokerto", city: "Mojokerto", base: 22300, coord: "−7.47° S · 112.43° E" },
  { id: "kediri",    name: "Kota Kediri",    city: "Kediri",    base: 21400, coord: "−7.82° S · 112.01° E" },
  { id: "blitar",    name: "Kota Blitar",    city: "Blitar",    base: 21300, coord: "−8.10° S · 112.17° E" },
  { id: "malang",    name: "Kota Malang",    city: "Malang",    base: 22200, coord: "−7.98° S · 112.63° E" },
  { id: "surabaya",  name: "Kota Surabaya",  city: "Surabaya",  base: 22300, coord: "−7.25° S · 112.75° E" },
  { id: "sidoarjo",  name: "Kota Sidoarjo",  city: "Sidoarjo",  base: 22400, coord: "−7.45° S · 112.72° E" },
];

export const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");


