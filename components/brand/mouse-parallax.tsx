"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type MouseParallaxProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MouseParallax({ children, className, strength = 12 }: MouseParallaxProps) {
  const [style, setStyle] = useState<CSSProperties>({});
  const frame = useRef<number | null>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;

    if (frame.current) window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      setStyle({
        "--parallax-x": `${x.toFixed(2)}px`,
        "--parallax-y": `${y.toFixed(2)}px`,
        "--parallax-rotate-x": `${(-y / 18).toFixed(2)}deg`,
        "--parallax-rotate-y": `${(x / 18).toFixed(2)}deg`
      } as CSSProperties);
    });
  }, [strength]);

  return (
    <div className={cn("mouse-parallax", className)} onPointerLeave={() => setStyle({})} onPointerMove={handlePointerMove} style={style}>
      {children}
    </div>
  );
}
