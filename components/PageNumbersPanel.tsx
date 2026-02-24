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
import type { PageNumberFormat, PageNumberPosition } from "@/lib/pdf-service";

interface PageNumbersPanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  format: PageNumberFormat;
  onFormatChange: (value: PageNumberFormat) => void;
  position: PageNumberPosition;
  onPositionChange: (value: PageNumberPosition) => void;
  onApply: () => void;
  loading: boolean;
  error: string | null;
}

const FORMAT_LABELS: Record<PageNumberFormat, string> = {
  "1": "1",
  "1 / N": "1 / N (es. 1 / 10)",
  "Pagina 1": "Pagina 1",
};

const POSITION_LABELS: Record<PageNumberPosition, string> = {
  "bottom-center": "In basso al centro",
  "bottom-right": "In basso a destra",
  "top-center": "In alto al centro",
  "top-right": "In alto a destra",
};

export function PageNumbersPanel({
  pdfFile,
  onPdfChange,
  format,
  onFormatChange,
  position,
  onPositionChange,
  onApply,
  loading,
  error,
}: PageNumbersPanelProps) {
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
        <Label>Formato numerazione</Label>
        <Select value={format} onValueChange={(v) => onFormatChange(v as PageNumberFormat)}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{FORMAT_LABELS["1"]}</SelectItem>
            <SelectItem value="1 / N">{FORMAT_LABELS["1 / N"]}</SelectItem>
            <SelectItem value="Pagina 1">{FORMAT_LABELS["Pagina 1"]}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <Label>Posizione</Label>
        <Select value={position} onValueChange={(v) => onPositionChange(v as PageNumberPosition)}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bottom-center">{POSITION_LABELS["bottom-center"]}</SelectItem>
            <SelectItem value="bottom-right">{POSITION_LABELS["bottom-right"]}</SelectItem>
            <SelectItem value="top-center">{POSITION_LABELS["top-center"]}</SelectItem>
            <SelectItem value="top-right">{POSITION_LABELS["top-right"]}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {pdfFile && (
        <Button type="button" className="w-full" onClick={onApply} disabled={loading}>
          {loading ? "Elaborazione..." : "Aggiungi numerazione e scarica"}
        </Button>
      )}
    </div>
  );
}
