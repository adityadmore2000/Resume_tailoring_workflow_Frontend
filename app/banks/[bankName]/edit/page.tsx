"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getBank, listBankFiles, putBankFileContent, readBankFile, reingestBank, updateBankMetadata } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { WorkflowProgressPanel } from "@/components/workflow/WorkflowProgressPanel";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";

export default function EditBankPage() {
  const params = useParams<{ bankName: string }>();
  const bankName = decodeURIComponent(params.bankName);

  const bankQuery = useQuery({ queryKey: ["bank", bankName], queryFn: () => getBank(bankName) });
  const filesQuery = useQuery({ queryKey: ["bankFiles", bankName], queryFn: () => listBankFiles(bankName) });

  const files = (filesQuery.data?.files ?? []).filter((f: any) => f.type === "markdown");
  const fileOptions = files.map((f: any) => ({ value: f.path, label: f.title ? `${f.title} (${f.path})` : f.path }));

  const [displayName, setDisplayName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [taskId, setTaskId] = React.useState<string | null>(null);

  const progressQuery = useWorkflowProgress(taskId);

  React.useEffect(() => {
    const b = bankQuery.data?.bank;
    if (!b) return;
    setDisplayName(b.display_name ?? b.bank_folder_name ?? bankName);
    setNotes(b.notes ?? "");
  }, [bankQuery.data, bankName]);

  const fileQuery = useQuery({
    queryKey: ["bankFileContent", bankName, selectedPath],
    queryFn: () => readBankFile(bankName, selectedPath as string),
    enabled: Boolean(selectedPath)
  });

  React.useEffect(() => {
    if (fileQuery.data?.content != null) setContent(fileQuery.data.content);
  }, [fileQuery.data]);

  const saveMeta = useMutation({
    mutationFn: () => updateBankMetadata(bankName, { display_name: displayName, notes }),
    onSuccess: () => bankQuery.refetch()
  });

  const saveFile = useMutation({
    mutationFn: () => putBankFileContent(bankName, { path: selectedPath ?? "", content }),
    onSuccess: () => filesQuery.refetch()
  });

  const reingest = useMutation({
    mutationFn: () => reingestBank(bankName),
    onSuccess: (data) => setTaskId(data.task_id)
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit Experience Bank</h1>
          <p className="mt-1 text-sm text-mutedForeground">
            Edits are explicit. Saving bank markdown marks the bank as manually modified and requires re-ingestion.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/banks/${encodeURIComponent(bankName)}/preview`}>
            <Button variant="outline">Back to Preview</Button>
          </Link>
          <Link href="/banks">
            <Button variant="outline">All Banks</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Metadata</CardTitle>
          <CardDescription>Safe fields like display name and notes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Display name</div>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Notes</div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button onClick={() => saveMeta.mutate()} disabled={saveMeta.isPending}>
              {saveMeta.isPending ? "Saving…" : "Save Metadata"}
            </Button>
            {saveMeta.error ? <div className="text-sm text-red-600">{String(saveMeta.error)}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Markdown Files</CardTitle>
          <CardDescription>Edit with caution. Changes affect retrieval and tailoring after re-ingestion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-2xl">
            <Select value={selectedPath} onChange={setSelectedPath} placeholder="Select a markdown file" options={fileOptions} disabled={filesQuery.isLoading} />
          </div>

          {fileQuery.isLoading ? <LoadingAnimation size={140} label="Loading file…" /> : null}

          {selectedPath ? (
            <Textarea className="min-h-[280px]" value={content} onChange={(e) => setContent(e.target.value)} />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => saveFile.mutate()} disabled={saveFile.isPending || !selectedPath}>
              {saveFile.isPending ? "Saving…" : "Save File"}
            </Button>
            <Button variant="secondary" onClick={() => reingest.mutate()} disabled={reingest.isPending}>
              {reingest.isPending ? "Re-ingesting…" : "Re-ingest into Qdrant"}
            </Button>
            {saveFile.error ? <div className="text-sm text-red-600">{String(saveFile.error)}</div> : null}
            {reingest.error ? <div className="text-sm text-red-600">{String(reingest.error)}</div> : null}
          </div>
        </CardContent>
      </Card>

      {progressQuery.data ? <WorkflowProgressPanel progress={progressQuery.data} onClose={() => setTaskId(null)} /> : null}
    </div>
  );
}

