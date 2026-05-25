"use client";

import { useQuery } from "@tanstack/react-query";

import { getTaskProgress } from "@/lib/api";

export type WorkflowProgress = {
  task_id: string;
  task_type: string;
  status: "running" | "completed" | "failed";
  current_step: string | null;
  steps: { id: string; label: string; status: "pending" | "active" | "completed" | "failed" }[];
  error: string | null;
  result?: any;
};

export function useWorkflowProgress(taskId: string | null) {
  return useQuery({
    queryKey: ["taskProgress", taskId],
    queryFn: () => getTaskProgress(taskId as string) as Promise<WorkflowProgress>,
    enabled: Boolean(taskId),
    refetchInterval: (q) => {
      const d = q.state.data as WorkflowProgress | undefined;
      if (!d) return 1000;
      return d.status === "running" ? 1000 : false;
    }
  });
}

