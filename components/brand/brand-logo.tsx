import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function BrandLogo({ href = "/", className, markClassName, textClassName }: BrandLogoProps) {
  return (
    <Link aria-label="TeachX Guru home" className={cn("group inline-flex items-center gap-3", className)} href={href}>
      <span className={cn("relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-ink text-sm font-semibold text-white shadow-brand transition-transform duration-brand group-hover:-translate-y-0.5", markClassName)}>
        <span className="absolute inset-x-2 top-1 h-4 rounded-full bg-white/20 blur-md" />
        TX
      </span>
      <span className={cn("leading-none", textClassName)}>
        <span className="block text-xl font-bold tracking-normal text-foreground">TeachX</span>
        <span className="mt-1 block text-[0.68rem] font-light uppercase tracking-[0.32em] text-muted-foreground">Guru</span>
      </span>
    </Link>
  );
}
