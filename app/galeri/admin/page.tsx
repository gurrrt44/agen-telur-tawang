"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { motion } from "motion/react";
import { Lock, Eye, Trash2, CheckCircle2, XCircle, LogOut, Loader2, AlertCircle, Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";
import { LABEL_COLORS } from "../page";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  submitter_name: string;
  label?: string;
  approved: boolean;
  created_at: string;
}

export default function GalleryAdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubmitterName, setEditSubmitterName] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editLabel, setEditLabel] = useState("Puas");

  const startEditing = (photo: Photo) => {
    setEditingId(photo.id);
    setEditSubmitterName(photo.submitter_name || "");
    setEditCaption(photo.caption || "");
    setEditLabel(photo.label || "Puas");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditSubmitterName("");
    setEditCaption("");
    setEditLabel("Puas");
  };

  const saveEdit = async (photoId: number) => {
    if (!adminPassword) return;

    const loadingToast = toast.loading("Menyimpan perubahan...");
    try {
      const res = await fetch("/api/gallery/photos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          id: photoId,
          submitter_name: editSubmitterName,
          caption: editCaption,
          label: editLabel,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Foto berhasil diperbarui!");
        setEditingId(null);
        fetchAdminPhotos();
      } else {
        toast.error("Gagal memperbarui foto: " + data.error);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Terjadi kesalahan.");
    }
  };

  // Periksa apakah password sudah tersimpan di sessionStorage saat halaman dimuat
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("gallery_admin_password");
    if (savedPassword) {
      verifyPassword(savedPassword);
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  // Fetch data foto ketika terautentikasi
  useEffect(() => {
    if (adminPassword) {
      fetchAdminPhotos();
    }
  }, [adminPassword]);

  async function verifyPassword(pwd: string) {
    try {
      const res = await fetch("/api/gallery/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminPassword(pwd);
        sessionStorage.setItem("gallery_admin_password", pwd);
      } else {
        sessionStorage.removeItem("gallery_admin_password");
        if (adminPassword) toast.error("Sesi telah berakhir, silakan login kembali.");
      }
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function fetchAdminPhotos() {
    if (!adminPassword) return;
    setLoadingPhotos(true);
    try {
      const res = await fetch("/api/gallery/photos", {
        headers: {
          "x-admin-password": adminPassword,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos || []);
      } else {
        toast.error("Gagal memuat daftar foto: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memuat foto.");
    } finally {
      setLoadingPhotos(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    
    setIsCheckingAuth(true);
    try {
      const res = await fetch("/api/gallery/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      
      if (data.success) {
        setAdminPassword(passwordInput);
        sessionStorage.setItem("gallery_admin_password", passwordInput);
        toast.success("Login admin berhasil!");
      } else {
        toast.error(data.error || "Password yang dimasukkan salah!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Koneksi gagal ke server.");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = () => {
    setAdminPassword(null);
    setPasswordInput("");
    sessionStorage.removeItem("gallery_admin_password");
    setPhotos([]);
    toast.success("Berhasil logout.");
  };

  const handleApproveToggle = async (photoId: number, currentApprovedStatus: boolean) => {
    if (!adminPassword) return;

    const actionText = currentApprovedStatus ? "Membatalkan persetujuan..." : "Menyetujui foto...";
    const loadingToast = toast.loading(actionText);

    try {
      const res = await fetch("/api/gallery/photos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          id: photoId,
          approved: !currentApprovedStatus,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success(currentApprovedStatus ? "Persetujuan dibatalkan!" : "Foto berhasil disetujui!");
        // Refresh list
        fetchAdminPhotos();
      } else {
        toast.error("Gagal memperbarui status: " + data.error);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!adminPassword) return;
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini secara permanen dari database?")) return;

    const loadingToast = toast.loading("Menghapus foto...");

    try {
      const res = await fetch(`/api/gallery/photos?id=${photoId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Foto berhasil dihapus!");
        // Refresh list
        fetchAdminPhotos();
      } else {
        toast.error("Gagal menghapus foto: " + data.error);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Terjadi kesalahan saat menghapus.");
    }
  };

  // Filter foto berdasarkan tab aktif
  const pendingPhotos = photos.filter((p) => !p.approved);
  const approvedPhotos = photos.filter((p) => p.approved);
  const activePhotos = activeTab === "pending" ? pendingPhotos : approvedPhotos;

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-[1280px] w-full px-6 py-16 lg:px-10">
        <FadeIn><SectionLabel n="Admin" label="Moderasi Galeri" /></FadeIn>

        {isCheckingAuth ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Memeriksa Sesi...</p>
          </div>
        ) : !adminPassword ? (
          /* Tampilan Form Login */
          <div className="max-w-md mx-auto mt-16">
            <FadeIn>
              <div className="border border-border bg-card p-8 rounded-sm shadow-xl text-center">
                <div className="mx-auto size-12 bg-secondary flex items-center justify-center rounded-full mb-6">
                  <Lock className="size-6 text-accent" />
                </div>
                <h2 className="font-serif text-3xl font-medium">Autentikasi Admin</h2>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Masukkan password admin untuk masuk ke dashboard moderasi persetujuan foto galeri.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <input
                    required
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password admin"
                    className="w-full border-b border-border bg-transparent py-2.5 px-1 font-mono text-center text-lg outline-none focus:border-accent"
                  />
                  
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="w-full inline-flex items-center justify-center rounded-sm bg-foreground py-3 font-mono text-xs uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-colors"
                  >
                    Masuk Dashboard
                  </motion.button>
                </form>
              </div>
            </FadeIn>
          </div>
        ) : (
          /* Tampilan Dashboard Moderasi Admin */
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border">
              <div>
                <h1 className="font-serif text-4xl font-medium">Dashboard Moderasi Foto</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Foto yang dikirim pengunjung disimpan sementara sampai disetujui. Tekan <strong>Setujui</strong> untuk memindahkannya ke galeri, atau <strong>Tolak</strong> untuk menghapusnya selamanya.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
            </div>

            {/* Tab Selector */}
            <div className="mt-8 flex border-b border-border">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 px-5 font-mono text-xs uppercase tracking-[0.16em] border-b-2 transition ${
                  activeTab === "pending"
                    ? "border-accent text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Menunggu Persetujuan ({pendingPhotos.length})
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`py-3 px-5 font-mono text-xs uppercase tracking-[0.16em] border-b-2 transition ${
                  activeTab === "approved"
                    ? "border-accent text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Telah Disetujui ({approvedPhotos.length})
              </button>
            </div>

            {/* Konten Foto */}
            <div className="mt-8">
              {loadingPhotos ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="size-8 animate-spin text-accent" />
                  <p className="font-mono text-xs text-muted-foreground">Memuat data foto...</p>
                </div>
              ) : activePhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border bg-secondary/10 rounded-sm p-6 text-center">
                  <AlertCircle className="size-8 text-muted-foreground/60 mb-3" />
                  <p className="font-serif text-lg text-muted-foreground">
                    Tidak ada foto dalam kategori ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="border border-border bg-card p-4 flex flex-col h-full rounded-sm"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.image_url}
                          alt="Testimoni"
                          className="size-full object-cover"
                        />
                        <a
                          href={photo.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/85 transition"
                          title="Lihat ukuran penuh"
                        >
                          <Eye className="size-4" />
                        </a>
                      </div>

                      {editingId === photo.id ? (
                        /* TAMPILAN EDITING MODE (CRUD) */
                        <div className="mt-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3.5">
                            {/* Input Nama Pengirim */}
                            <label className="block">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Pengirim:</span>
                              <input
                                type="text"
                                value={editSubmitterName}
                                onChange={(e) => setEditSubmitterName(e.target.value)}
                                className="w-full bg-secondary/40 text-sm border border-border px-2.5 py-1.5 rounded-sm outline-none mt-1 font-serif focus:border-accent transition"
                                maxLength={30}
                              />
                            </label>

                            {/* Seleksi Label */}
                            <label className="block">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Penilaian (Label):</span>
                              <select
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="w-full bg-secondary/40 text-sm border border-border px-2.5 py-1.5 rounded-sm outline-none mt-1 font-mono focus:border-accent transition cursor-pointer"
                              >
                                <option value="Puas">Puas</option>
                                <option value="Cukup Puas">Cukup Puas</option>
                                <option value="Kurang Puas">Kurang Puas</option>
                                <option value="Kurang">Kurang</option>
                              </select>
                            </label>

                            {/* Input Pesan/Caption */}
                            <label className="block">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Pesan / Caption:</span>
                              <textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                rows={3}
                                className="w-full bg-secondary/40 text-sm border border-border px-2.5 py-1.5 rounded-sm outline-none mt-1 font-serif resize-none focus:border-accent transition"
                                maxLength={140}
                              />
                            </label>
                          </div>

                          {/* Tombol Simpan / Batal */}
                          <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-3">
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground border border-border py-2 rounded-sm hover:bg-secondary transition"
                            >
                              <X className="size-4" /> Batal
                            </button>
                            
                            <button
                              onClick={() => saveEdit(photo.id)}
                              className="inline-flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-background bg-foreground py-2 rounded-sm hover:bg-foreground/90 transition font-semibold"
                            >
                              <Check className="size-4 text-background" /> Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* TAMPILAN NORMAL (PREVIEW & CONTROL) */
                        <div className="mt-4 flex-1 flex flex-col justify-between">
                          <div>
                            {photo.label && (
                              <div className="mb-2">
                                <span className={`inline-block px-2.5 py-0.5 border text-[9px] uppercase tracking-widest font-mono rounded-sm ${LABEL_COLORS[photo.label]?.badge || "bg-secondary text-muted-foreground border-border"}`}>
                                  {photo.label}
                                </span>
                              </div>
                            )}
                            <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-semibold">
                              Pengirim: {photo.submitter_name}
                            </div>
                            <p className="mt-2 font-serif text-sm italic text-foreground/90 leading-relaxed">
                              "{photo.caption || "Tanpa caption"}"
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              {/* Tombol Edit */}
                              <button
                                onClick={() => startEditing(photo)}
                                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-foreground hover:bg-secondary px-3 py-1.5 rounded-sm transition"
                                title="Edit data foto"
                              >
                                <Edit3 className="size-4 text-accent" /> Edit
                              </button>

                              {/* Tombol Tolak/Hapus */}
                              <button
                                onClick={() => handleDelete(photo.id)}
                                className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm transition ${
                                  !photo.approved
                                    ? "text-destructive hover:bg-destructive/10"
                                    : "text-destructive hover:bg-destructive/10"
                                }`}
                                title={photo.approved ? "Hapus foto" : "Tolak & hapus foto"}
                              >
                                <Trash2 className="size-4" /> {photo.approved ? "Hapus" : "Tolak"}
                              </button>
                            </div>

                            {/* Tombol Setujui / Batalkan */}
                            {photo.approved ? (
                              <button
                                onClick={() => handleApproveToggle(photo.id, true)}
                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground hover:bg-secondary py-2 rounded-sm border border-border transition"
                              >
                                <XCircle className="size-4 text-orange-600" /> Batal ACC
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveToggle(photo.id, false)}
                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-emerald-700 hover:bg-emerald-700/10 py-2 rounded-sm border border-emerald-700/30 transition font-semibold"
                              >
                                <CheckCircle2 className="size-4" /> Setujui
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
