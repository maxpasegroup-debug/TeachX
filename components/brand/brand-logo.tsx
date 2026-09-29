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
    <Link aria-label="TeachX Guru" className={cn("group inline-flex items-center gap-2", className)} href={href}>
      <span className={cn("relative flex h-11 w-11 shrink-0 items-center justify-center", markClassName)}>
        <img alt="" className="h-full w-full object-contain" height={455} src="/brand/logo-mark.png" width={343} />
      </span>
      <span className={cn("flex items-center", textClassName)}>
        <img alt="" src="/brand/logo-wordmark.png" style={{ height: 35, width: "auto" }} />
      </span>
    </Link>
  );
}
