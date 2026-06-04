"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Egg, ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  const navLinks = [
    { name: "Tentang", href: "/#tentang", key: "tentang" },
    { name: "Harga", href: "/#harga", key: "harga" },
    { name: "Paket", href: "/#paket", key: "paket" },
    { name: "Galeri", href: "/galeri", key: "galeri" },
    { name: "Pesan", href: "/#pesan", key: "pesan" },
    { name: "Lokasi", href: "/#lokasi", key: "lokasi" },
  ];

  useEffect(() => {
    if (pathname !== "/") return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0.05,
    });

    const sections = ["tentang", "harga", "paket", "pesan", "lokasi"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="grid size-9 place-items-center rounded-sm bg-foreground text-background"
          >
            <Egg className="size-4" strokeWidth={1.5} />
          </motion.div>
          <div className="leading-tight">
            <div className="font-serif text-lg">Agen Telur Tawang</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
              est. 2008 — Mojokrapak, Jombang, Jawa Timur
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {navLinks.map((link) => {
            const isActive = link.key === "galeri"
              ? pathname.startsWith("/galeri")
              : pathname === "/" && activeSection === link.key;

            return (
              <Link key={link.name} href={link.href} className="group relative py-1">
                <span className={`transition ${isActive ? "text-foreground font-semibold" : "group-hover:text-foreground"}`}>
                  {link.name}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="active-nav-line"
                    className="absolute -bottom-1 left-0 h-px w-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {/* Desktop Call to Action */}
          <motion.a
            href={pathname === "/" ? "#pesan" : "/#pesan"}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="hidden items-center gap-2 rounded-sm bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-background md:inline-flex"
          >
            Pesan <ArrowUpRight className="size-3.5" />
          </motion.a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="grid size-9 place-items-center rounded-sm border border-border text-foreground md:hidden hover:bg-secondary focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-border bg-background md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {navLinks.map((link, idx) => {
                const isActive = link.key === "galeri"
                  ? pathname.startsWith("/galeri")
                  : pathname === "/" && activeSection === link.key;

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-1 transition ${isActive ? "text-foreground font-semibold pl-2 border-l-2 border-accent" : "hover:text-foreground"}`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.a
                href={pathname === "/" ? "#pesan" : "/#pesan"}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-foreground py-3 font-mono text-xs uppercase tracking-[0.18em] text-background"
              >
                Pesan <ArrowUpRight className="size-3.5" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
