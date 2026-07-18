import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type MotionPrimitiveProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "fade-up" | "fade-left" | "fade-right" | "scale" | "float" | "rotate" | "soft-glow" | "page";
  delay?: "none" | "sm" | "md" | "lg";
};

const variants = {
  "fade-up": "motion-fade-up",
  "fade-left": "motion-fade-left",
  "fade-right": "motion-fade-right",
  scale: "motion-scale",
  float: "motion-float",
  rotate: "motion-rotate",
  "soft-glow": "motion-soft-glow",
  page: "motion-page"
};

const delays = {
  none: "",
  sm: "motion-delay-sm",
  md: "motion-delay-md",
  lg: "motion-delay-lg"
};

export function MotionPrimitive({ children, className, variant = "fade-up", delay = "none", ...props }: MotionPrimitiveProps) {
  return (
    <div className={cn(variants[variant], delays[delay], className)} {...props}>
      {children}
    </div>
  );
}
