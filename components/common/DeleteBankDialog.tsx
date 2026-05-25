"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeleteBankDialog({
  open,
  bankName,
  onCancel,
  onConfirm,
  isDeleting,
  error
}: {
  open: boolean;
  bankName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string | null;
}) {
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  if (!open) return null;

  const canDelete = typed.trim() === bankName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-5 text-card-foreground shadow-lg">
        <div className="text-lg font-semibold">Delete Experience Bank</div>
        <div className="mt-2 text-sm text-muted-foreground">
          This will delete the Experience Bank and its retrieval index. Generated resumes may remain unless deleted separately.
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Type the bank name to confirm</div>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={bankName} />
          <div className="text-xs text-muted-foreground">Confirmation required: <code>{bankName}</code></div>
        </div>

        {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={Boolean(isDeleting)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!canDelete || Boolean(isDeleting)}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

