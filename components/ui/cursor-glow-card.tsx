"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

export function CursorGlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const bg = useTransform(
    [mx, my],
    ([x, y]) => `radial-gradient(280px circle at ${x}px ${y}px, rgba(232,168,56,0.18), transparent 60%)`
  );
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => { mx.set(-200); my.set(-200); }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div style={{ background: bg }} className="pointer-events-none absolute inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
