"use client";

import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkflowStep({
  label,
  status,
  icon: Icon
}: {
  label: string;
  status: "pending" | "active" | "completed" | "failed";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const StateIcon =
    status === "completed" ? CircleCheck : status === "failed" ? CircleX : status === "active" ? LoaderCircle : null;

  return (
    <div className={cn("flex items-center gap-2", status === "pending" ? "text-mutedForeground" : "text-foreground")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", status === "pending" ? "opacity-60" : "")} />
        {StateIcon ? (
          <StateIcon className={cn("h-4 w-4", status === "active" ? "animate-spin" : "")} />
        ) : (
          <div className="h-4 w-4 rounded-full border border-border" />
        )}
      </div>
      <div className={cn("text-xs font-medium", status === "active" ? "text-foreground" : "")}>{label}</div>
    </div>
  );
}

