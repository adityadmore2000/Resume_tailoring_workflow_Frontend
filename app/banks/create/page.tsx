"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createBank } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { WorkflowProgressPanel } from "@/components/workflow/WorkflowProgressPanel";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";

export default function CreateBankPage() {
  const router = useRouter();
  const [bankName, setBankName] = React.useState("");
  const [overwrite, setOverwrite] = React.useState(false);
  const [resumeText, setResumeText] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [taskId, setTaskId] = React.useState<string | null>(null);

  const progressQuery = useWorkflowProgress(taskId);

  const mutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.set("bank_name", bankName);
      form.set("overwrite", overwrite ? "true" : "false");
      if (file) form.set("file", file);
      if (!file && resumeText.trim()) form.set("resume_text", resumeText);
      return createBank(form);
    },
    onSuccess: (data) => {
      setTaskId(data.task_id);
    }
  });

  React.useEffect(() => {
    const p = progressQuery.data;
    if (!p) return;
    if (p.status === "completed" && p.result?.bank_folder_name) {
      router.push(`/banks/${encodeURIComponent(p.result.bank_folder_name)}/preview`);
    }
  }, [progressQuery.data, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Experience Bank</h1>
        <p className="mt-1 text-sm text-mutedForeground">Step 1 of 4 — Convert your master resume into a reusable Experience Bank.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why this page exists</CardTitle>
          <CardDescription>Tailoring does not re-read resumes. Experience Banks become the source-of-truth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-mutedForeground">
          <div>
            Input guidance: upload a master resume (MVP: <code>.tex</code> or <code>.txt</code>) and use a stable bank name.
          </div>
          <div>Hint: You’ll reuse this bank name for every job instead of uploading resumes repeatedly.</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">Bank name</div>
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., aditya_ai_master_resume" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Overwrite existing bank</div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            I understand overwrite may replace an existing bank
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master resume input</CardTitle>
          <CardDescription>Upload a file, or paste content. Tailoring will use the bank, not this file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept=".tex,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <div className="text-xs text-mutedForeground">PDF support is planned; MVP expects .tex or .txt.</div>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Or paste resume text / LaTeX"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || Boolean(taskId) || !bankName.trim() || (!file && !resumeText.trim())}
        >
          {mutation.isPending || taskId ? "Generating…" : "Generate Experience Bank"}
        </Button>
        <Link href="/banks">
          <Button variant="outline">Back to banks</Button>
        </Link>
      </div>

      {mutation.error ? <div className="text-sm text-red-600">{String(mutation.error)}</div> : null}

      {taskId ? <LoadingAnimation label="Generating your Experience Bank…" /> : null}

      {progressQuery.data ? (
        <WorkflowProgressPanel progress={progressQuery.data} onClose={() => setTaskId(null)} />
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4 text-sm text-mutedForeground">
        Recommended next step after creation: <Link className="underline" href="/banks">Preview the bank</Link>, then tailor a JD.
      </div>
    </div>
  );
}
