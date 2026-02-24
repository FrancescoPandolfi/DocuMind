"use client";

import { Button } from "@/components/ui/button";
import { PageInput } from "@/components/PageInput";

interface RemovePanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  pages: string;
  onPagesChange: (value: string) => void;
  onRemove: () => void;
  loading: boolean;
  error: string | null;
}

export function RemovePanel({
  pdfFile,
  onPdfChange,
  pages,
  onPagesChange,
  onRemove,
  loading,
  error,
}: RemovePanelProps) {
  return (
    <div className="space-y-6">
      {pdfFile && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">PDF</h3>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2">
            <span className="truncate text-sm text-muted-foreground">{pdfFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPdfChange(null)}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              Rimuovi
            </Button>
          </div>
        </section>
      )}

      <section>
        <PageInput
          value={pages}
          onChange={onPagesChange}
          placeholder="2, 4, 6"
          label="Pagine da rimuovere"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Singole pagine o intervalli da eliminare
        </p>
      </section>

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {pdfFile && (
        <Button
          type="button"
          className="w-full"
          onClick={onRemove}
          disabled={loading || !pages.trim()}
        >
          {loading ? "Elaborazione..." : "Rimuovi e scarica"}
        </Button>
      )}
    </div>
  );
}
