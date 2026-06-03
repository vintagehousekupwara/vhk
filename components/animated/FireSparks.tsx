"use client";

import { useEffect, useState } from "react";

// Pre-calculated random-looking values to avoid Next.js hydration mismatches
const SPARK_DATA = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDuration: `${Math.random() * 4 + 4}s`, // 4s to 8s
  animationDelay: `${Math.random() * 5}s`,
  size: `${Math.random() * 4 + 2}px`, // 2px to 6px
  opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
}));

export default function FireSparks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes float-ember {
          0% {
            transform: translateY(110vh) translateX(0px) scale(1);
            opacity: 0;
          }
          20% {
            opacity: var(--max-opacity);
          }
          50% {
            transform: translateY(50vh) translateX(20px) scale(0.8);
          }
          80% {
            opacity: var(--max-opacity);
          }
          100% {
            transform: translateY(-10vh) translateX(-20px) scale(0.2);
            opacity: 0;
          }
        }
        .ember-particle {
          animation: float-ember linear infinite;
          will-change: transform, opacity;
          box-shadow: 0 0 8px 2px rgba(200, 106, 43, 0.6);
        }
      `}</style>

      {SPARK_DATA.map((spark) => (
        <div
          key={spark.id}
          className="ember-particle absolute rounded-full bg-brand-primary"
          style={{
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDuration: spark.animationDuration,
            animationDelay: spark.animationDelay,
            '--max-opacity': spark.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}