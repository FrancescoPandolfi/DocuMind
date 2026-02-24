"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RotatePanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  angle: number;
  onAngleChange: (angle: number) => void;
  numPages: number;
  rotateAll: boolean;
  onRotateAllChange: (value: boolean) => void;
  selectedPages: Set<number>;
  onTogglePage: (pageNum: number) => void;
  onRotate: () => void;
  loading: boolean;
  error: string | null;
}

export function RotatePanel({
  pdfFile,
  onPdfChange,
  angle,
  onAngleChange,
  numPages,
  rotateAll,
  onRotateAllChange,
  selectedPages,
  onTogglePage,
  onRotate,
  loading,
  error,
}: RotatePanelProps) {
  const pagesToRotate = rotateAll ? numPages : selectedPages.size;

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
        <Label>Angolo di rotazione</Label>
        <Select value={String(angle)} onValueChange={(v) => onAngleChange(Number(v))}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0°</SelectItem>
            <SelectItem value="90">90°</SelectItem>
            <SelectItem value="180">180°</SelectItem>
            <SelectItem value="270">270°</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <Label>Pagine da ruotare</Label>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onRotateAllChange(true)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
              rotateAll
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-muted text-muted-foreground hover:border-border"
            }`}
          >
            Tutte
          </button>
          <button
            type="button"
            onClick={() => onRotateAllChange(false)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
              !rotateAll
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-muted text-muted-foreground hover:border-border"
            }`}
          >
            Selezionate
          </button>
        </div>
        {!rotateAll && numPages > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto">
            <p className="mb-2 text-xs text-muted-foreground">
              Clicca sulle pagine da ruotare (anteprima a sinistra)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
                const isSelected = selectedPages.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onTogglePage(p)}
                    className={`flex size-8 items-center justify-center rounded border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted hover:border-primary/50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
          onClick={onRotate}
          disabled={loading || (!rotateAll && pagesToRotate === 0)}
        >
          {loading ? "Elaborazione..." : `Ruota e scarica (${rotateAll ? numPages : pagesToRotate} pagine)`}
        </Button>
      )}
    </div>
  );
}
