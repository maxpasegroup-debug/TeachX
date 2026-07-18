"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

type MouseParallaxProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MouseParallax({ children, className, strength = 12 }: MouseParallaxProps) {
  const [style, setStyle] = useState<CSSProperties>({});

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
    setStyle({
      "--parallax-x": `${x.toFixed(2)}px`,
      "--parallax-y": `${y.toFixed(2)}px`
    } as CSSProperties);
  }, [strength]);

  return (
    <div className={cn("mouse-parallax", className)} onPointerLeave={() => setStyle({})} onPointerMove={handlePointerMove} style={style}>
      {children}
    </div>
  );
}
