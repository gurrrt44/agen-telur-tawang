"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: "star" | "circle" | "diamond";
}

const SPARKLE_COLORS = [
  "#e8a838", // accent gold
  "#fbbf24", // amber
  "#fcd34d", // yellow
  "#f59e0b", // darker amber
  "#fef3c7", // cream
  "#ffffff", // white
];

const SPARKLE_TYPES: Sparkle["type"][] = ["star", "circle", "diamond"];

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const idCounter = useRef(0);
  const [isTouch, setIsTouch] = useState(false);
  const lastSpawnRef = useRef(0);

  // Draw a 4-pointed star
  const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      const innerAngle = angle + Math.PI / 4;
      const innerX = Math.cos(innerAngle) * size * 0.35;
      const innerY = Math.sin(innerAngle) * size * 0.35;
      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.restore();
  }, []);

  // Draw a diamond
  const drawDiamond = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.6, 0);
    ctx.closePath();
    ctx.restore();
  }, []);

  const spawnSparkle = useCallback((x: number, y: number, velocityScale = 1) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 1.5 + 0.5) * velocityScale;
    const sparkle: Sparkle = {
      id: idCounter.current++,
      x,
      y,
      size: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      opacity: 1,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5, // slight upward bias
      life: 0,
      maxLife: Math.random() * 40 + 25,
      type: SPARKLE_TYPES[Math.floor(Math.random() * SPARKLE_TYPES.length)],
    };
    sparklesRef.current.push(sparkle);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn sparkles based on mouse movement
    const dx = mouseRef.current.x - prevMouseRef.current.x;
    const dy = mouseRef.current.y - prevMouseRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const now = Date.now();

    if (speed > 2 && now - lastSpawnRef.current > 30) {
      // More sparkles when moving faster
      const count = Math.min(Math.floor(speed / 8) + 1, 4);
      for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * 16;
        const offsetY = (Math.random() - 0.5) * 16;
        spawnSparkle(
          mouseRef.current.x + offsetX,
          mouseRef.current.y + offsetY,
          Math.min(speed / 15, 2)
        );
      }
      lastSpawnRef.current = now;
    }

    // Also spawn occasional ambient sparkle near cursor even when still
    if (now - lastSpawnRef.current > 200 && mouseRef.current.x > 0) {
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      spawnSparkle(
        mouseRef.current.x + offsetX,
        mouseRef.current.y + offsetY,
        0.3
      );
      lastSpawnRef.current = now;
    }

    prevMouseRef.current.x = mouseRef.current.x;
    prevMouseRef.current.y = mouseRef.current.y;

    // Update and draw sparkles
    sparklesRef.current = sparklesRef.current.filter((s) => {
      s.life++;
      if (s.life >= s.maxLife) return false;

      // Physics
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.03; // gravity
      s.vx *= 0.98; // friction
      s.rotation += 0.05;

      // Fade out
      const progress = s.life / s.maxLife;
      s.opacity = 1 - progress;
      const currentSize = s.size * (1 - progress * 0.5);

      // Draw
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = currentSize * 2;

      if (s.type === "star") {
        drawStar(ctx, s.x, s.y, currentSize, s.rotation);
        ctx.fill();
      } else if (s.type === "diamond") {
        drawDiamond(ctx, s.x, s.y, currentSize, s.rotation);
        ctx.fill();
      } else {
        // Circle with glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, currentSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      return true;
    });

    ctx.globalAlpha = 1;

    // Draw subtle glow ring around cursor position
    if (mouseRef.current.x > 0) {
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 35
      );
      gradient.addColorStop(0, "rgba(232, 168, 56, 0.12)");
      gradient.addColorStop(0.5, "rgba(232, 168, 56, 0.04)");
      gradient.addColorStop(1, "rgba(232, 168, 56, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [spawnSparkle, drawStar, drawDiamond]);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -100;
      mouseRef.current.y = -100;
    };

    // Spawn burst on click
    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 12; i++) {
        spawnSparkle(e.clientX, e.clientY, 2.5);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("click", handleClick);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, spawnSparkle]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="custom-cursor-canvas"
      aria-hidden="true"
    />
  );
}
