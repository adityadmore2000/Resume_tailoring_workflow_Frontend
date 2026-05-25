"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { listBanks, tailorResume } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { WorkflowProgressPanel } from "@/components/workflow/WorkflowProgressPanel";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";
import { EmptyStateAnimation } from "@/components/common/EmptyStateAnimation";

export default function TailorClientPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const preselected = sp.get("bank");

  const banksQuery = useQuery({ queryKey: ["banks"], queryFn: listBanks });
  const bankOptions = (banksQuery.data?.banks ?? []).map((b) => ({ value: b.bank_folder_name, label: b.bank_folder_name }));

  const [bank, setBank] = React.useState<string | null>(preselected);
  const [jdText, setJdText] = React.useState("");
  const [lastLog, setLastLog] = React.useState<string | null>(null);
  const [taskId, setTaskId] = React.useState<string | null>(null);

  const progressQuery = useWorkflowProgress(taskId);

  const mutation = useMutation({
    mutationFn: () => tailorResume({ bank_name: bank ?? "", jd_text: jdText }),
    onSuccess: (data) => {
      setTaskId(data.task_id);
      setLastLog("Tailoring started…");
    }
  });

  React.useEffect(() => {
    const p = progressQuery.data;
    if (!p) return;
    if (p.status === "completed" && p.result?.resume_id) {
      router.push(`/resumes/${encodeURIComponent(p.result.resume_id)}/preview`);
    }
  }, [progressQuery.data, router]);

  function clearForm() {
    setBank(preselected ?? null);
    setJdText("");
    setLastLog(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tailor Resume</h1>
          <p className="mt-1 text-sm text-mutedForeground">
            Step 3 of 4 — Select an Experience Bank and provide a Job Description. Only verified evidence is used.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearForm}>
            Clear Form
          </Button>
          <Link href="/banks">
            <Button variant="outline">Experience Banks</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How this works</CardTitle>
          <CardDescription>Retrieval → verification → assembly from your bank.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-mutedForeground">
          <div>- Unsupported skills/tools are not added automatically.</div>
          <div>- Resume uploads are not required during tailoring.</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">Experience Bank</div>
          {bankOptions.length === 0 ? (
            <EmptyStateAnimation
              title="No Experience Banks found"
              description="Create your first Experience Bank to start tailoring resumes."
              ctaLabel="Create Experience Bank"
              ctaHref="/banks/create"
              className="items-stretch md:items-center"
            />
          ) : (
            <Select value={bank} onChange={setBank} placeholder="Select an Experience Bank" options={bankOptions} />
          )}
          <div className="text-xs text-mutedForeground">
            What is an Experience Bank? A reusable knowledge base extracted from your master resume.
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Job Description</div>
          <Textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the JD here…" />
          <div className="text-xs text-mutedForeground">
            Hint: keep the JD specific. The retriever uses it to include (and exclude) content.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || Boolean(taskId) || !bank || !jdText.trim()}>
          {mutation.isPending || taskId ? "Tailoring…" : "Tailor Resume"}
        </Button>
        <div className="text-xs text-mutedForeground">
          Why was a skill excluded? It wasn’t supported by verified evidence in your bank.
        </div>
      </div>

      {mutation.error ? <div className="text-sm text-red-600">{String(mutation.error)}</div> : null}
      {lastLog ? <div className="text-sm text-mutedForeground">{lastLog}</div> : null}
      {taskId ? <LoadingAnimation label="Tailoring your resume…" /> : null}
      {progressQuery.data ? <WorkflowProgressPanel progress={progressQuery.data} onClose={() => setTaskId(null)} /> : null}
    </div>
  );
}

