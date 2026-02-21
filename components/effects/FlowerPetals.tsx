"use client";

import React from "react";

const COLORS = ["#f8b4c4", "#ffc8dd", "#fde2e4", "#fce7f3", "#fdf2f8", "#fef3c7"];

// SSR/CSR 일치를 위해 Math.random() 대신 고정값 사용 (hydration 오류 방지)
const PETALS = [
  { left: 8, delay: 0, duration: 12, size: 10, drift: -8 },
  { left: 22, delay: 2.1, duration: 14, size: 11, drift: 12 },
  { left: 45, delay: 0.5, duration: 10, size: 9, drift: -5 },
  { left: 67, delay: 4.2, duration: 15, size: 13, drift: 10 },
  { left: 85, delay: 1.3, duration: 11, size: 10, drift: -12 },
  { left: 15, delay: 5.8, duration: 13, size: 12, drift: 7 },
  { left: 38, delay: 3.0, duration: 9, size: 8, drift: -10 },
  { left: 55, delay: 6.5, duration: 16, size: 14, drift: 5 },
  { left: 72, delay: 1.0, duration: 10, size: 9, drift: -7 },
  { left: 92, delay: 4.7, duration: 12, size: 11, drift: 9 },
  { left: 5, delay: 2.5, duration: 11, size: 10, drift: -9 },
  { left: 78, delay: 7.2, duration: 14, size: 12, drift: 6 },
];

export default function FlowerPetals() {

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[25] overflow-hidden"
      aria-hidden
    >
      {PETALS.map((p, i) => (
        <div
          key={i}
          className="petal-fall absolute -top-4"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.5,
            background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}aa, ${COLORS[i % COLORS.length]}50)`,
            borderRadius: "50% 50% 50% 0",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: `0 0 2px ${COLORS[i % COLORS.length]}30`,
            "--petal-drift": `${p.drift}px`,
          } as React.CSSProperties & { "--petal-drift": string }}
        />
      ))}
    </div>
  );
}
