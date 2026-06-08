"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="theme-toggle-pill"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.88 }}
    >
      {/* Track background with sky / night gradient */}
      <motion.div
        className="theme-toggle-track"
        animate={{
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
            : "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Stars (visible in dark mode) */}
        <AnimatePresence>
          {isDark && (
            <>
              {[
                { top: "18%", left: "18%", size: 2, delay: 0 },
                { top: "30%", left: "30%", size: 1.5, delay: 0.1 },
                { top: "14%", left: "45%", size: 2.5, delay: 0.15 },
                { top: "50%", left: "22%", size: 1.5, delay: 0.2 },
                { top: "42%", left: "38%", size: 2, delay: 0.05 },
                { top: "65%", left: "28%", size: 1, delay: 0.25 },
              ].map((star, i) => (
                <motion.span
                  key={`star-${i}`}
                  className="theme-toggle-star"
                  style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: star.delay },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: star.delay },
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Clouds (visible in light mode) */}
        <AnimatePresence>
          {!isDark && (
            <>
              <motion.span
                className="theme-toggle-cloud theme-toggle-cloud-1"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 0.7, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.4 }}
              />
              <motion.span
                className="theme-toggle-cloud theme-toggle-cloud-2"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 0.5, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* The knob (sun/moon) */}
        <motion.div
          className="theme-toggle-knob"
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28, mass: 1 }}
        >
          <AnimatePresence mode="wait">
            {!isDark ? (
              <motion.div
                key="sun"
                className="theme-toggle-icon-wrap"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="theme-toggle-sun">
                  <div className="theme-toggle-sun-face" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={`ray-${i}`}
                    className="theme-toggle-ray"
                    style={{ transform: `rotate(${i * 45}deg) translateY(-12px)` }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 0.85 }}
                    transition={{ duration: 0.25, delay: i * 0.02, ease: "easeOut" }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                className="theme-toggle-icon-wrap"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="theme-toggle-moon">
                  <div className="theme-toggle-moon-crater" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
