"use client";

import * as React from "react";

import { WorkflowProgressPanel } from "@/components/workflow/WorkflowProgressPanel";
import { useWorkflowProgressController } from "@/components/workflow/workflow-progress-context";

export function WorkflowProgressPanelHost() {
  const { state, progress, actions } = useWorkflowProgressController();

  if (!state.isVisible || !progress) return null;

  return (
    <WorkflowProgressPanel
      progress={progress}
      onClose={actions.closePanel}
      isCollapsed={state.isCollapsed}
      onToggleCollapsed={(v) => actions.setCollapsed(v)}
    />
  );
}

