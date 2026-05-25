"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { applyBankEdit, getBankEditHistory, proposeBankEdit, rejectBankEdit } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AIBankEditorPage() {
  const params = useParams<{ bankName: string }>();
  const bankName = decodeURIComponent(params.bankName);

  const [instruction, setInstruction] = React.useState("");
  const [activeProposalId, setActiveProposalId] = React.useState<string | null>(null);
  const [latestProposal, setLatestProposal] = React.useState<any | null>(null);

  const historyQuery = useQuery({ queryKey: ["bank-edit-history", bankName], queryFn: () => getBankEditHistory(bankName) });

  const proposeMutation = useMutation({
    mutationFn: () => proposeBankEdit(bankName, { instruction }),
    onSuccess: (data) => {
      setLatestProposal(data);
      setActiveProposalId(data?.proposal_id ?? null);
      historyQuery.refetch();
    }
  });

  const applyMutation = useMutation({
    mutationFn: () => applyBankEdit(bankName, activeProposalId as string),
    onSuccess: (data) => {
      setLatestProposal((prev: any) => ({ ...(prev ?? {}), appliedResult: data }));
      historyQuery.refetch();
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectBankEdit(bankName, activeProposalId as string),
    onSuccess: () => {
      historyQuery.refetch();
    }
  });

  const validation = latestProposal?.validation ?? latestProposal?.appliedResult?.validation;
  const proposedChange = latestProposal?.proposed_changes?.[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">AI Bank Editor</h1>
          <p className="mt-1 text-sm text-mutedForeground">
            Request changes in natural language. Proposed edits are validated and require approval before they affect your Experience Bank.
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
          <CardTitle>Instruction</CardTitle>
          <CardDescription>
            Example: “Rewrite the Neilsoft bullet to sound more GenAI relevant but do not add fake skills.”
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Describe the change you want…" />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => proposeMutation.mutate()} disabled={proposeMutation.isPending || !instruction.trim()}>
              {proposeMutation.isPending ? "Proposing…" : "Propose Change"}
            </Button>
            {proposeMutation.error ? <div className="text-sm text-red-600">{String(proposeMutation.error)}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retrieved related KB records</CardTitle>
          <CardDescription>Used to scope the proposal (Qdrant retrieval is best-effort).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(latestProposal?.target_records ?? []).length === 0 ? (
            <div className="text-mutedForeground">No related records retrieved yet.</div>
          ) : (
            <ul className="list-disc pl-5">
              {(latestProposal?.target_records ?? []).map((r: any, idx: number) => (
                <li key={idx}>
                  <span className="font-medium">{r.source_file || r.record_id}</span>
                  {r.score != null ? <span className="text-mutedForeground"> — score: {String(r.score)}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposed changes preview</CardTitle>
          <CardDescription>Nothing is applied until you approve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!proposedChange ? (
            <div className="text-sm text-mutedForeground">No proposal yet.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-mutedForeground">Old</div>
                <pre className="mt-1 max-h-[320px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {proposedChange.old_content}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-mutedForeground">New</div>
                <pre className="mt-1 max-h-[320px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {proposedChange.new_content}
                </pre>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={!activeProposalId || applyMutation.isPending || validation?.status !== "passed"}
            >
              {applyMutation.isPending ? "Applying…" : "Approve & Apply"}
            </Button>
            <Button
              variant="outline"
              onClick={() => rejectMutation.mutate()}
              disabled={!activeProposalId || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject"}
            </Button>
            {applyMutation.error ? <div className="text-sm text-red-600">{String(applyMutation.error)}</div> : null}
            {rejectMutation.error ? <div className="text-sm text-red-600">{String(rejectMutation.error)}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation result</CardTitle>
          <CardDescription>Immutable fields are protected; unsupported claims are rejected.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!validation ? <div className="text-mutedForeground">No validation yet.</div> : null}
          {validation ? (
            <>
              <div>
                Status: <span className="font-medium">{validation.status}</span>
              </div>
              {(validation.immutable_field_changes ?? []).length ? (
                <div>
                  <div className="text-xs font-semibold text-mutedForeground">Immutable field changes</div>
                  <ul className="list-disc pl-5">
                    {(validation.immutable_field_changes ?? []).map((x: string, i: number) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {(validation.unsupported_claims ?? []).length ? (
                <div>
                  <div className="text-xs font-semibold text-mutedForeground">Unsupported claims</div>
                  <ul className="list-disc pl-5">
                    {(validation.unsupported_claims ?? []).map((x: string, i: number) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {(validation.warnings ?? []).length ? (
                <div>
                  <div className="text-xs font-semibold text-mutedForeground">Warnings</div>
                  <ul className="list-disc pl-5">
                    {(validation.warnings ?? []).map((x: string, i: number) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change history</CardTitle>
          <CardDescription>Previous accepted/rejected proposals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {historyQuery.isLoading ? <div className="text-mutedForeground">Loading…</div> : null}
          {historyQuery.error ? <div className="text-red-600">{String(historyQuery.error)}</div> : null}
          {(historyQuery.data?.history ?? []).length === 0 ? (
            <div className="text-mutedForeground">No history yet.</div>
          ) : (
            <ul className="list-disc pl-5">
              {(historyQuery.data?.history ?? []).map((h: any) => (
                <li key={h.proposal_id}>
                  <span className="font-medium">{h.status}</span> — {h.instruction}
                  <span className="text-mutedForeground"> (validation: {h.validation_status})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced raw edit (developer mode)</CardTitle>
          <CardDescription>
            Disabled by default. Prefer the AI Bank Editor workflow to keep edits evidence-grounded.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-mutedForeground">
          Raw markdown editing is intentionally not exposed as the primary UX.
        </CardContent>
      </Card>
    </div>
  );
}

