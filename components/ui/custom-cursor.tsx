"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Track mouse pos with refs for performance (no re-renders)
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: 5 }, () => ({ x: -100, y: -100 }))
  );
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    // Dot follows mouse tightly
    dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.35;
    dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.35;

    // Ring follows with slight lag (elastic)
    ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

    // Trail particles follow with cascading delay
    for (let i = 0; i < trailPositions.current.length; i++) {
      const target = i === 0 ? dotPos.current : trailPositions.current[i - 1];
      const speed = 0.12 - i * 0.015;
      trailPositions.current[i].x += (target.x - trailPositions.current[i].x) * speed;
      trailPositions.current[i].y += (target.y - trailPositions.current[i].y) * speed;
    }

    // Apply transforms
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${isHovering ? 1.8 : isClicking ? 0.7 : 1})`;
    }

    // Update trail particles
    trailsRef.current.forEach((trail, i) => {
      if (trail) {
        const pos = trailPositions.current[i];
        trail.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
    });

    rafId.current = requestAnimationFrame(animate);
  }, [isHovering, isClicking]);

  useEffect(() => {
    // Skip on touch devices
    const checkTouch = () => {
      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        setIsTouch(true);
        return true;
      }
      return false;
    };
    if (checkTouch()) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Detect hovering on interactive elements
    const handleHoverIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, textarea, select, label, .cursor-hover")) {
        setIsHovering(true);
      }
    };
    const handleHoverOut = () => setIsHovering(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleHoverIn, { passive: true });
    document.addEventListener("mouseout", handleHoverOut, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleHoverIn);
      document.removeEventListener("mouseout", handleHoverOut);
      cancelAnimationFrame(rafId.current);
    };
  }, [isVisible, animate]);

  // Don't render on touch devices
  if (isTouch) return null;

  return (
    <div
      className="custom-cursor-container"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Trail particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => {
            if (el) trailsRef.current[i] = el;
          }}
          className="custom-cursor-trail"
          style={{
            width: 6 - i,
            height: 6 - i,
            opacity: 0.3 - i * 0.05,
          }}
        />
      ))}

      {/* Outer ring — elastic follow with glow */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
      />

      {/* Inner dot — precise follow */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
      />
    </div>
  );
}
