"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

const COLORS = ["#6b2d5e", "#a0508e", "#e0a9d2", "#c8963e", "#f1e8dd"];

/** One celebratory burst from both sides; skipped when "reduce motion" is on. */
export function Confetti() {
  useEffect(() => {
    const fire = (originX: number, angle: number) =>
      confetti({
        particleCount: 70,
        angle,
        spread: 60,
        startVelocity: 55,
        origin: { x: originX, y: 0.7 },
        colors: COLORS,
        disableForReducedMotion: true,
      });
    const id = setTimeout(() => {
      fire(0, 60);
      fire(1, 120);
    }, 250);
    return () => clearTimeout(id);
  }, []);
  return null;
}
