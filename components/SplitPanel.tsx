"use client";

import { Button } from "@/components/ui/button";
import { PageInput } from "@/components/PageInput";

interface SplitPanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  pages: string;
  onPagesChange: (value: string) => void;
  onSplit: () => void;
  loading: boolean;
  error: string | null;
}

export function SplitPanel({
  pdfFile,
  onPdfChange,
  pages,
  onPagesChange,
  onSplit,
  loading,
  error,
}: SplitPanelProps) {
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
          placeholder="1-3, 4-6, 7-10"
          label="Intervalli di pagine"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Ogni intervallo diventa un file separato (es. 1-3, 4-6)
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
          onClick={onSplit}
          disabled={loading || !pages.trim()}
        >
          {loading ? "Elaborazione..." : "Dividi e scarica"}
        </Button>
      )}
    </div>
  );
}
