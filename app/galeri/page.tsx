"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, Sparkles, AlertCircle, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  submitter_name: string;
  created_at: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form state
  const [submitterName, setSubmitterName] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const res = await fetch("/api/gallery/photos");
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
      } else {
        console.error("Gagal mengambil foto:", data.error);
      }
    } catch (err) {
      console.error("Gagal mengambil foto:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi jenis file
      if (!file.type.startsWith("image/")) {
        toast.error("Format file harus berupa gambar!");
        return;
      }
      
      // Validasi ukuran (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 5MB!");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Silakan pilih gambar terlebih dahulu!");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("caption", caption);
      formData.append("submitter_name", submitterName || "Anonim");

      const res = await fetch("/api/gallery/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal mengunggah foto.");
      }

      toast.success("Foto testimoni berhasil diunggah! Menunggu persetujuan admin untuk tampil.");
      
      // Reset form
      setSubmitterName("");
      setCaption("");
      setSelectedFile(null);
      setModalOpen(false);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-[1280px] w-full px-6 py-16 lg:px-10">
        <FadeIn><SectionLabel n="Galeri" label="Testimoni Pelanggan" /></FadeIn>
        
        {/* Header Galeri */}
        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <FadeIn delay={0.05} className="max-w-2xl">
            <h1 className="font-serif text-5xl leading-tight md:text-6xl">
              Sudut Galeri <em className="italic text-accent">Keluarga</em> Tawang.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Lihat kepuasan para pelanggan kami. Anda juga bisa berbagi kesegaran telur Agen Tawang dengan mengunggah foto kiriman telur Anda di bawah ini!
            </p>
          </FadeIn>
          
          <FadeIn delay={0.1} className="shrink-0 flex items-center gap-3">
            <Link href="/galeri/admin">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Settings className="size-4" /> Admin ACC
              </motion.button>
            </Link>

            <motion.button
              onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-sm bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-background shadow-md hover:bg-foreground/90 transition-colors"
            >
              <Upload className="size-4" /> Unggah Foto
            </motion.button>
          </FadeIn>
        </div>

        {/* Grid Foto Galeri */}
        <div className="mt-14 border-t border-border pt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin text-accent" />
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Memuat Galeri...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 bg-secondary/20 rounded-md p-6 text-center">
              <AlertCircle className="size-8 text-muted-foreground/60 mb-3" />
              <p className="font-serif text-lg text-muted-foreground">Belum ada foto yang disetujui admin.</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/75">
                Jadilah yang pertama mengunggah foto testimoni!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="group relative overflow-hidden border border-border bg-card p-4 transition-all hover:border-foreground/30 flex flex-col h-full"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-secondary relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Testimoni Agen Telur Tawang"}
                      className="size-full object-cover transition duration-500 group-hover:scale-103"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 flex-1 flex flex-col justify-between">
                    {photo.caption ? (
                      <p className="font-serif text-base italic text-foreground/90 leading-relaxed">
                        "{photo.caption}"
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 italic">
                        Tanpa pesan tertulis.
                      </p>
                    )}
                    
                    <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-accent font-semibold">
                        <Sparkles className="size-3" />
                        {photo.submitter_name}
                      </span>
                      <span>
                        {new Date(photo.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Form Upload */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative z-10 w-full max-w-lg overflow-hidden border border-border bg-card p-6 sm:p-8 shadow-2xl rounded-sm"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-serif text-2xl font-medium">Unggah Foto Testimoni</h3>
                <button
                  onClick={() => !uploading && setModalOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* File Upload Dropzone */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Pilih File Gambar *</span>
                  <label className="flex flex-col items-center justify-center w-full h-36 border border-dashed border-border rounded-sm bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <Sparkles className="size-6 text-accent mx-auto" />
                        <p className="font-serif text-sm font-semibold text-foreground line-clamp-1">{selectedFile.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Klik untuk ganti
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="size-6 text-muted-foreground/60 mx-auto" />
                        <p className="font-serif text-sm text-foreground">Pilih file gambar dari perangkat</p>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/75">
                          Format JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Submitter Name */}
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nama Anda (Opsional)</span>
                  <input
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-base outline-none transition-colors focus:border-accent"
                    placeholder="Ibu Wulandari / Anonim"
                    disabled={uploading}
                    maxLength={30}
                  />
                </label>

                {/* Testimonial Caption */}
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pesan / Testimoni (Opsional)</span>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none border border-border bg-transparent p-3 text-sm outline-none transition-colors focus:border-accent"
                    placeholder="Kualitas telurnya mantap, pengiriman cepat & kurirnya ramah!"
                    disabled={uploading}
                    maxLength={140}
                  />
                </label>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={uploading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-background shadow hover:bg-foreground/90 transition disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-background" />
                      Mengunggah...
                    </>
                  ) : (
                    <>Unggah Foto</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
