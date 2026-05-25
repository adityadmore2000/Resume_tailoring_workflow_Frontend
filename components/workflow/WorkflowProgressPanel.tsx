"use client";

import * as React from "react";
import {
  Database,
  FileCheck2,
  FileSearch,
  GitCompareArrows,
  Network,
  PenLine,
  Rows3,
  Save,
  ScanSearch,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";
import { WorkflowStep } from "@/components/workflow/WorkflowStep";
import { Button } from "@/components/ui/button";
import type { WorkflowProgress } from "@/hooks/useWorkflowProgress";

const iconByStepId: Record<string, React.ComponentType<{ className?: string }>> = {
  resume_parsed: FileSearch,
  jd_analyzed: ScanSearch,
  experience_matched: GitCompareArrows,
  content_tailored: PenLine,
  finalized: FileCheck2,

  experience_extracted: Rows3,
  knowledge_structured: Network,
  bank_generated: Database,
  saved: Save
};

export function WorkflowProgressPanel({
  progress,
  onClose,
  isCollapsed,
  onToggleCollapsed
}: {
  progress: WorkflowProgress;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
}) {
  const collapsed = Boolean(isCollapsed);

  const steps = progress.steps ?? [];
  const activeIdx = steps.findIndex((s) => s.status === "active");

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-lg">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {progress.task_type === "experience_bank_generation" ? "Generating Experience Bank" : "Tailoring Resume"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {progress.status === "failed"
                  ? progress.error ?? "Failed"
                  : progress.status === "completed"
                    ? "Completed"
                    : activeIdx >= 0
                      ? `Working on: ${steps[activeIdx]?.label}`
                      : "Working…"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleCollapsed?.(!collapsed)}
                disabled={!onToggleCollapsed}
              >
                {collapsed ? "Expand" : "Collapse"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!collapsed ? (
            <div className={cn("flex flex-wrap gap-x-6 gap-y-2 px-4 pb-4", progress.status === "failed" ? "" : "")}>
              {steps.map((s) => {
                const Icon = iconByStepId[s.id] ?? FileSearch;
                return <WorkflowStep key={s.id} label={s.label} status={s.status} icon={Icon} />;
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
