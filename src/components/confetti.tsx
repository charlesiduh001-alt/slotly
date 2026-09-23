"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

// Spec badge pastels plus ink: a small chromatic flourish on a monochrome page.
const COLORS = ["#111111", "#fb923c", "#ec4899", "#8b5cf6", "#34d399"];

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
