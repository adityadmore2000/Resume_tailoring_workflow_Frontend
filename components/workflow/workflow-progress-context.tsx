"use client";

import * as React from "react";

import { useWorkflowProgress, type WorkflowProgress } from "@/hooks/useWorkflowProgress";

export type WorkflowTaskType = WorkflowProgress["task_type"];

export type WorkflowProgressState = {
  activeTaskId: string | null;
  taskType: WorkflowTaskType | null;
  steps: WorkflowProgress["steps"];
  status: WorkflowProgress["status"] | null;
  error: string | null;
  isCollapsed: boolean;
  isVisible: boolean;
};

type WorkflowProgressActions = {
  startWorkflowTask: (args: { taskId: string; taskType: WorkflowTaskType }) => void;
  closePanel: () => void;
  setCollapsed: (collapsed: boolean) => void;
  reset: () => void;
};

type WorkflowProgressContextValue = {
  state: WorkflowProgressState;
  progress: WorkflowProgress | null;
  actions: WorkflowProgressActions;
};

const WorkflowProgressContext = React.createContext<WorkflowProgressContextValue | null>(null);

const COMPLETED_AUTO_HIDE_MS = 1800;

export function WorkflowProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<WorkflowProgressState>({
    activeTaskId: null,
    taskType: null,
    steps: [],
    status: null,
    error: null,
    isCollapsed: false,
    isVisible: false
  });

  const progressQuery = useWorkflowProgress(state.activeTaskId);
  const progress = (progressQuery.data as WorkflowProgress | undefined) ?? null;

  const autoHideTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (autoHideTimerRef.current != null) window.clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!progress) return;

    setState((prev) => {
      const next: WorkflowProgressState = {
        ...prev,
        taskType: progress.task_type,
        steps: progress.steps ?? [],
        status: progress.status,
        error: progress.error ?? null
      };
      return next;
    });

    if (progress.status === "completed") {
      if (autoHideTimerRef.current != null) window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, isVisible: false, isCollapsed: false }));
      }, COMPLETED_AUTO_HIDE_MS);
    }
  }, [progress]);

  const actions = React.useMemo<WorkflowProgressActions>(() => {
    return {
      startWorkflowTask: ({ taskId, taskType }) => {
        if (autoHideTimerRef.current != null) window.clearTimeout(autoHideTimerRef.current);
        setState({
          activeTaskId: taskId,
          taskType,
          steps: [],
          status: "running",
          error: null,
          isCollapsed: false,
          isVisible: true
        });
      },
      closePanel: () => {
        if (autoHideTimerRef.current != null) window.clearTimeout(autoHideTimerRef.current);
        setState((prev) => ({ ...prev, isVisible: false }));
      },
      setCollapsed: (collapsed) => setState((prev) => ({ ...prev, isCollapsed: collapsed })),
      reset: () => {
        if (autoHideTimerRef.current != null) window.clearTimeout(autoHideTimerRef.current);
        setState({
          activeTaskId: null,
          taskType: null,
          steps: [],
          status: null,
          error: null,
          isCollapsed: false,
          isVisible: false
        });
      }
    };
  }, []);

  const value = React.useMemo<WorkflowProgressContextValue>(() => ({ state, progress, actions }), [state, progress, actions]);

  return <WorkflowProgressContext.Provider value={value}>{children}</WorkflowProgressContext.Provider>;
}

export function useWorkflowProgressController() {
  const ctx = React.useContext(WorkflowProgressContext);
  if (!ctx) throw new Error("useWorkflowProgressController must be used within WorkflowProgressProvider");
  return ctx;
}

