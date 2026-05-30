"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { listBankItems } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BankItem = {
  id: string;
  type: string;
  title: string;
  raw_path: string;
  domains: string[];
  tools: string[];
  date_range?: string;
  location?: string;
};

function chips(items: string[]) {
  const xs = Array.from(new Set((items ?? []).map((x) => x.trim()).filter(Boolean))).slice(0, 16);
  return (
    <div className="flex flex-wrap gap-2">
      {xs.map((x) => (
        <span key={x} className="rounded-md bg-muted px-2 py-0.5 text-xs text-mutedForeground">
          {x}
        </span>
      ))}
    </div>
  );
}

export default function BankPreviewPage() {
  const params = useParams<{ bankName: string }>();
  const bankName = decodeURIComponent(params.bankName);
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["bank-items", bankName],
    queryFn: () => listBankItems(bankName)
  });

  const items = (itemsQuery.data?.items ?? []) as BankItem[];
  const grouped = React.useMemo(() => {
    const exp = items.filter((x) => x.type === "work_experience");
    const proj = items.filter((x) => x.type === "project");
    const cap = items.filter((x) => x.type === "capability");
    return { exp, proj, cap };
  }, [items]);

  React.useEffect(() => {
    if (!selectedKey && items.length) setSelectedKey(`${items[0].type}:${items[0].id}`);
  }, [items, selectedKey]);

  const selectedItem = React.useMemo(() => {
    if (!selectedKey) return null;
    const [t, id] = selectedKey.split(":");
    return items.find((x) => x.type === t && x.id === id) ?? null;
  }, [items, selectedKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Preview Bank</h1>
          <p className="mt-1 text-sm text-mutedForeground">This view is backed by Postgres `resume_nodes` (no file-based bank runtime).</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tailor?bank=${encodeURIComponent(bankName)}`}>
            <Button>Tailor Resume</Button>
          </Link>
          <Link href="/banks">
            <Button variant="outline">Back to banks</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What you’re seeing</CardTitle>
          <CardDescription>Searchable nodes and extracted metadata from your stored resume tree.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-mutedForeground">
          Tailoring uses Qdrant resume_nodes retrieval scoped to this resume.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3 text-sm font-medium">{bankName}</div>
          {itemsQuery.isLoading ? <div className="text-sm text-mutedForeground">Loading…</div> : null}
          {itemsQuery.error ? <div className="text-sm text-red-600">{String(itemsQuery.error)}</div> : null}

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs font-semibold text-mutedForeground">Experience</div>
            <div className="mt-2 space-y-1">
              {grouped.exp.map((it) => {
                const key = `${it.type}:${it.id}`;
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    className={`w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accentForeground ${active ? "bg-accent font-medium text-accentForeground" : ""}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    {it.title}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-xs font-semibold text-mutedForeground">Projects</div>
            <div className="mt-2 space-y-1">
              {grouped.proj.map((it) => {
                const key = `${it.type}:${it.id}`;
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    className={`w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accentForeground ${active ? "bg-accent font-medium text-accentForeground" : ""}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    {it.title}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-xs font-semibold text-mutedForeground">Capabilities</div>
            <div className="mt-2 space-y-1">
              {grouped.cap.map((it) => {
                const key = `${it.type}:${it.id}`;
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    className={`w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accentForeground ${active ? "bg-accent font-medium text-accentForeground" : ""}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    {it.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle>Select an item</CardTitle>
                <CardDescription>Choose Experience / Projects / Capabilities from the left.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedItem.title}</CardTitle>
                  <CardDescription>{selectedItem.type.replaceAll("_", " ")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedItem.tools?.length ? (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-mutedForeground">Tools</div>
                      {chips(selectedItem.tools)}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Debug</CardTitle>
                  <CardDescription>Raw item payload.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <pre className="overflow-auto rounded-md bg-muted p-3 text-foreground">{JSON.stringify(selectedItem, null, 2)}</pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
