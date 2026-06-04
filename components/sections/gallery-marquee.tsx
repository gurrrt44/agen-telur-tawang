"use client";

import { useEffect, useState } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { FadeIn } from "@/components/ui/fade-in";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  submitter_name: string;
  label?: string;
  created_at?: string;
}

const MARQUEE_LABEL_BADGES: Record<string, string> = {
  "Puas": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Cukup Puas": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Kurang Puas": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Kurang": "bg-rose-500/20 text-rose-300 border-rose-500/30"
};

const FALLBACK_PHOTOS: Photo[] = [
  {
    id: -1,
    image_url: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEyP5OairPaDJ_NC2QW_r2U5lN62wtmp6CMKhm9pzb7uMyzOPjI4cne664p-vcOX4USUgJZhWNjoCcLpfjFXCw3aNytsI-PJ0xaNftcX668u1xSPUeiPwGGJFgQqj1TIPU77DWE=w600-h450-k-no",
    caption: "Telur ayam grade A tersortir rapi dan siap kirim ke pelanggan.",
    submitter_name: "Agen Telur Tawang",
  },
  {
    id: -2,
    image_url: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEyP5OairPaDJ_NC2QW_r2U5lN62wtmp6CMKhm9pzb7uMyzOPjI4cne664p-vcOX4USUgJZhWNjoCcLpfjFXCw3aNytsI-PJ0xaNftcX668u1xSPUeiPwGGJFgQqj1TIPU77DWE=w800-h600-k-no",
    caption: "Foto dari depan toko kami, silakan mampir langsung untuk memilih sendiri.",
    submitter_name: "Kunjungan Toko",
  },
  {
    id: -3,
    image_url: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEyP5OairPaDJ_NC2QW_r2U5lN62wtmp6CMKhm9pzb7uMyzOPjI4cne664p-vcOX4USUgJZhWNjoCcLpfjFXCw3aNytsI-PJ0xaNftcX668u1xSPUeiPwGGJFgQqj1TIPU77DWE=w500-h400-k-no",
    caption: "Telur segar kami kumpulkan dari peternak mitra setiap pagi.",
    submitter_name: "Peternakan Mitra",
  },
  {
    id: -4,
    image_url: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEyP5OairPaDJ_NC2QW_r2U5lN62wtmp6CMKhm9pzb7uMyzOPjI4cne664p-vcOX4USUgJZhWNjoCcLpfjFXCw3aNytsI-PJ0xaNftcX668u1xSPUeiPwGGJFgQqj1TIPU77DWE=w500-h500-k-no",
    caption: "Grade A pilihan, telur tebal dan berukuran besar seragam.",
    submitter_name: "Grade A Fresh",
  }
];

export function GalleryMarquee() {
  const [photos, setPhotos] = useState<Photo[]>(FALLBACK_PHOTOS);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch("/api/gallery/photos");
        const data = await res.json();
        if (data.success && data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        } else {
          setPhotos(FALLBACK_PHOTOS);
        }
      } catch (err) {
        console.error("Gagal memuat foto galeri:", err);
        setPhotos(FALLBACK_PHOTOS);
      }
    }
    fetchPhotos();
  }, []);

  // Gandakan array agar transisi marquee tidak terputus secara visual
  const marqueeList = [...photos, ...photos];

  return (
    <section className="border-b border-border bg-background py-20 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <FadeIn><SectionLabel n="04" label="Galeri Pengunjung & Toko" /></FadeIn>
        
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <FadeIn delay={0.1}>
            <h2 className="max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Foto kiriman pelanggan kami. <em className="italic text-accent">Kualitas</em> nyata dari kandang.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-accent" />
              Punya foto testimoni? Unggah di halaman galeri!
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Infinite Train Marquee Wrapper */}
      <div className="relative mt-14 w-full">
        {/* Style block khusus untuk animasi marquee yang smooth */}
        <style>{`
          @keyframes infinite-marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .gallery-track {
            display: flex;
            width: max-content;
            animation: infinite-marquee 35s linear infinite;
          }
          .gallery-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="gallery-track flex gap-6 px-3">
          {marqueeList.map((photo, i) => (
            <div
              key={`${photo.id}-${i}`}
              className="group relative h-64 w-80 shrink-0 overflow-hidden border border-border bg-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image_url}
                alt={photo.caption || "Foto Agen Telur Tawang"}
                className="size-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay Glassmorphism */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    <Sparkles className="size-3" />
                    <span>Kiriman · {photo.submitter_name}</span>
                  </div>
                  {photo.label && (
                    <span className={`px-2 py-0.5 border text-[7px] uppercase tracking-wider font-mono rounded-sm ${MARQUEE_LABEL_BADGES[photo.label] || "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
                      {photo.label}
                    </span>
                  )}
                </div>
                {photo.caption && (
                  <p className="mt-2 font-serif text-sm leading-relaxed text-slate-100 line-clamp-2 font-medium">
                    "{photo.caption}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
