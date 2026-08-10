"use client";

import { useEffect, useState } from "react";

type Floor = {
  label: string;
  timezone: string;
};

const FLOORS: Floor[] = [
  { label: "Support", timezone: "GMT+8" },
  { label: "Product", timezone: "GMT+1" },
  { label: "Sales", timezone: "GMT-5" },
  { label: "Hiring", timezone: "GMT+0" },
  { label: "Leadership", timezone: "GMT+3" },
];

const WINDOWS_PER_FLOOR = 10;

// Deterministic pseudo-random so server and client render the same markup,
// then we animate client-side after mount.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function OfficeTower() {
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const litCount = FLOORS.length * WINDOWS_PER_FLOOR;

  return (
    <div className="w-full">
      <div className="flex flex-col-reverse gap-[6px] rounded-lg border border-line bg-ink-soft p-3 sm:p-4">
        {FLOORS.map((floor, floorIndex) => (
          <div key={floor.label} className="flex items-center gap-3 sm:gap-4">
            <div className="hidden w-24 shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-text-dim sm:block sm:w-28">
              {floor.label}
            </div>
            <div className="grid flex-1 grid-cols-10 gap-[4px] sm:gap-[6px]">
              {Array.from({ length: WINDOWS_PER_FLOOR }).map((_, winIndex) => {
                const seed = floorIndex * 97 + winIndex * 13 + tick * 3.1;
                const isLit = seededRandom(seed) > 0.34;
                return (
                  <div
                    key={winIndex}
                    aria-hidden
                    className="aspect-square rounded-[2px] transition-colors duration-700"
                    style={{
                      backgroundColor:
                        mounted && isLit ? "var(--lamp)" : "var(--line)",
                      opacity: mounted && isLit ? 0.95 : 0.35,
                      boxShadow:
                        mounted && isLit
                          ? "0 0 6px 0 rgba(242,184,75,0.55)"
                          : "none",
                    }}
                  />
                );
              })}
            </div>
            <div className="hidden w-14 shrink-0 font-mono text-[10px] text-text-dim md:block">
              {floor.timezone}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-text-dim">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-live" />
          LIVE — desks lit right now
        </span>
        <span>{litCount} desks across 5 floors</span>
      </div>
    </div>
  );
}
