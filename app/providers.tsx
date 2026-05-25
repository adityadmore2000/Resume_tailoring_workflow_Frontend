"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { WorkflowProgressProvider } from "@/components/workflow/workflow-progress-context";
import { WorkflowProgressPanelHost } from "@/components/workflow/WorkflowProgressPanelHost";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WorkflowProgressProvider>
          {children}
          <WorkflowProgressPanelHost />
        </WorkflowProgressProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
