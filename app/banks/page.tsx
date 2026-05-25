"use client";

import Link from "next/link";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { deleteBank, listBanks } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateAnimation } from "@/components/common/EmptyStateAnimation";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
import { DeleteBankDialog } from "@/components/common/DeleteBankDialog";

export default function BanksPage() {
  const banksQuery = useQuery({ queryKey: ["banks"], queryFn: listBanks });
  const { data, isLoading, error } = banksQuery;

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bankToDelete, setBankToDelete] = React.useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (bankName: string) => deleteBank(bankName),
    onSuccess: () => {
      setDeleteOpen(false);
      setBankToDelete(null);
      banksQuery.refetch();
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Experience Banks</h1>
        <p className="mt-1 text-sm text-mutedForeground">Step 1–2 of 4: create and review your reusable knowledge base.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What this page does</CardTitle>
          <CardDescription>Lists the Experience Banks available for tailoring.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-mutedForeground">
          Recommended next step: create a bank from your master resume, then preview it before tailoring.
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/banks/create">
          <Button>Create Experience Bank</Button>
        </Link>
        <Link href="/tailor">
          <Button variant="outline">Tailor Resume</Button>
        </Link>
      </div>

      {isLoading ? <LoadingAnimation label="Loading banks…" size={140} /> : null}
      {error ? <div className="text-sm text-red-600">{String(error)}</div> : null}

      {!isLoading && data?.banks?.length === 0 ? (
        <EmptyStateAnimation
          title="No Experience Banks found"
          description="Create your first Experience Bank to start tailoring resumes."
          ctaLabel="Create Experience Bank"
          ctaHref="/banks/create"
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {data?.banks?.map((b) => (
          <Card key={b.bank_folder_name}>
            <CardHeader>
              <CardTitle>{b.bank_folder_name}</CardTitle>
              <CardDescription>{b.status ? `Status: ${b.status}` : "Bank"}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Link href={`/banks/${encodeURIComponent(b.bank_folder_name)}/preview`}>
                <Button variant="secondary">Preview</Button>
              </Link>
              <Link href={`/banks/${encodeURIComponent(b.bank_folder_name)}/edit`}>
                <Button variant="outline">AI Bank Editor</Button>
              </Link>
              <Link href={`/tailor?bank=${encodeURIComponent(b.bank_folder_name)}`}>
                <Button variant="outline">Tailor</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => {
                  setBankToDelete(b.bank_folder_name);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteBankDialog
        open={deleteOpen}
        bankName={bankToDelete ?? ""}
        onCancel={() => {
          setDeleteOpen(false);
          setBankToDelete(null);
        }}
        onConfirm={() => {
          if (!bankToDelete) return;
          deleteMutation.mutate(bankToDelete);
        }}
        isDeleting={deleteMutation.isPending}
        error={deleteMutation.error ? String(deleteMutation.error) : null}
      />
    </div>
  );
}
