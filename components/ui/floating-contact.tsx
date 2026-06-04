"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-80 rounded-xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold">Hubungi Kami</h4>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Punya pertanyaan atau ingin pesan? Chat langsung via WhatsApp!
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-2 shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <a
              href="https://wa.me/6285606022228?text=Assalamualaikum, permisi Pak saya ingin memesan telur.Apakah tersedia?"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-4 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#1fb855] active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-block size-2.5 rounded-full bg-[#25D366]" />
              Online — biasanya balas dalam 5 menit
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Theme Toggle */}
      <ThemeToggle />

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] py-3.5 pl-4 pr-5 font-mono text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />

        {open ? (
          <X className="relative size-5" />
        ) : (
          <>
            <MessageCircle className="relative size-5" />
            <span className="relative hidden sm:inline">Hubungi kami</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
