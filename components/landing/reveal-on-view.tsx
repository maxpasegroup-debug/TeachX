"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function RevealOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
    if (reduce) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShown(true);
      observer.disconnect();
    }, { threshold: 0.28 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn(className, shown && "is-shown")} ref={ref}>
      {children}
    </div>
  );
}
