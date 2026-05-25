"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DotLottieReact = dynamic(
  async () => {
    const mod = await import("@lottiefiles/dotlottie-react");
    return mod.DotLottieReact;
  },
  { ssr: false }
);

export function EmptyStateAnimation({
  title,
  description,
  ctaLabel,
  ctaHref,
  className
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8", className)}>
      <div className="h-[220px] w-[220px]">
        <DotLottieReact src="/assets/no-data.dotlottie" autoplay loop />
      </div>
      <div className="text-center">
        <div className="text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-mutedForeground">{description}</div>
      </div>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}

