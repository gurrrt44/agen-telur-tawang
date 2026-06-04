"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    if (isAnimating) return;

    const nextTheme = theme === "light" ? "dark" : "light";

    // Get button position for circular wipe origin
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate max radius needed to cover entire viewport
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Try View Transitions API first (modern browsers)
    if (document.startViewTransition) {
      setIsAnimating(true);

      // Set CSS custom property for circle origin
      document.documentElement.style.setProperty("--toggle-x", `${x}px`);
      document.documentElement.style.setProperty("--toggle-y", `${y}px`);
      document.documentElement.style.setProperty("--toggle-max-r", `${maxRadius}px`);

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      });

      transition.finished.then(() => {
        setIsAnimating(false);
      });
    } else {
      // Fallback: use overlay element for circular wipe
      setIsAnimating(true);

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background: ${nextTheme === "dark" ? "#0e0d0a" : "#fbfaf6"};
        clip-path: circle(0px at ${x}px ${y}px);
        transition: clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      document.body.appendChild(overlay);

      // Trigger animation
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
      });

      // Apply theme change midway
      setTimeout(() => {
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, 350);

      // Remove overlay after animation
      setTimeout(() => {
        overlay.remove();
        setIsAnimating(false);
      }, 750);
    }
  }, [theme, isAnimating]);

  const isDark = theme === "dark";

  return (
    <motion.button
      ref={buttonRef}
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
        transition={{ duration: 0.6, ease: "easeInOut" }}
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
                  style={{
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: star.delay,
                    },
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: star.delay,
                    },
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

        {/* The knob (sun/moon) — springy with stutter */}
        <motion.div
          className="theme-toggle-knob"
          animate={{
            x: isDark ? 26 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 15,
            mass: 1.2,
            restDelta: 0.01,
          }}
        >
          {/* Sun/Moon icon with stepped stuttering rotation */}
          <AnimatePresence mode="wait">
            {!isDark ? (
              <motion.div
                key="sun"
                className="theme-toggle-icon-wrap"
                initial={{ rotate: -180, scale: 0, opacity: 0 }}
                animate={{
                  rotate: [null, -60, -20, 10, -5, 0],
                  scale: [0, 0.6, 1.15, 0.9, 1.05, 1],
                  opacity: [0, 0.5, 0.8, 1, 1, 1],
                }}
                exit={{
                  rotate: 180,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.65,
                  ease: "easeOut",
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                {/* Sun body */}
                <div className="theme-toggle-sun">
                  <div className="theme-toggle-sun-face" />
                </div>
                {/* Sun rays — appear one by one with stagger delay */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={`ray-${i}`}
                    className="theme-toggle-ray"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-12px)`,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{
                      scaleY: [0, 1.5, 0.7, 1.2, 1],
                      opacity: [0, 1, 0.6, 1, 0.85],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.15 + i * 0.04,
                      ease: "easeOut",
                      times: [0, 0.3, 0.5, 0.7, 1],
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                className="theme-toggle-icon-wrap"
                initial={{ rotate: 180, scale: 0, opacity: 0 }}
                animate={{
                  rotate: [null, 60, 20, -10, 5, 0],
                  scale: [0, 0.6, 1.2, 0.85, 1.05, 1],
                  opacity: [0, 0.5, 0.8, 1, 1, 1],
                }}
                exit={{
                  rotate: -180,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.65,
                  ease: "easeOut",
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                <div className="theme-toggle-moon">
                  {/* Moon crescent cutout */}
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
