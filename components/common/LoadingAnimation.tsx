"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

const DotLottieReact = dynamic(
  async () => {
    const mod = await import("@lottiefiles/dotlottie-react");
    return mod.DotLottieReact;
  },
  { ssr: false }
);

export function LoadingAnimation({
  size = 180,
  label,
  className
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div style={{ width: size, height: size }}>
        <DotLottieReact src="/assets/loading.dotlottie" autoplay loop />
      </div>
      {label ? <div className="text-sm text-mutedForeground">{label}</div> : null}
    </div>
  );
}

