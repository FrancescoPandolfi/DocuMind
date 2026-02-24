"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WatermarkPosition } from "@/lib/pdf-service";

interface WatermarkPanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  text: string;
  onTextChange: (value: string) => void;
  position: WatermarkPosition;
  onPositionChange: (value: WatermarkPosition) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onApply: () => void;
  loading: boolean;
  error: string | null;
}

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  center: "Centro",
  "bottom-right": "In basso a destra",
  "bottom-left": "In basso a sinistra",
  "top-right": "In alto a destra",
  "top-left": "In alto a sinistra",
};

export function WatermarkPanel({
  pdfFile,
  onPdfChange,
  text,
  onTextChange,
  position,
  onPositionChange,
  opacity,
  onOpacityChange,
  imageFile,
  onImageChange,
  onApply,
  loading,
  error,
}: WatermarkPanelProps) {
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
        <Label>Testo watermark</Label>
        <Input
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Es. CONFIDENTIALE"
          className="mt-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Lascia vuoto se usi un&apos;immagine come logo
        </p>
      </section>

      <section>
        <Label>Logo (opzionale)</Label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              onImageChange(f ?? null);
            }}
            className="file:mr-2"
          />
          {imageFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onImageChange(null)}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              Rimuovi
            </Button>
          )}
        </div>
      </section>

      <section>
        <Label>Posizione</Label>
        <Select value={position} onValueChange={(v) => onPositionChange(v as WatermarkPosition)}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center">{POSITION_LABELS.center}</SelectItem>
            <SelectItem value="bottom-right">{POSITION_LABELS["bottom-right"]}</SelectItem>
            <SelectItem value="bottom-left">{POSITION_LABELS["bottom-left"]}</SelectItem>
            <SelectItem value="top-right">{POSITION_LABELS["top-right"]}</SelectItem>
            <SelectItem value="top-left">{POSITION_LABELS["top-left"]}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <Label>Opacità: {Math.round(opacity * 100)}%</Label>
        <input
          type="range"
          min="10"
          max="100"
          value={opacity * 100}
          onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
          className="mt-2 w-full"
        />
      </section>

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {pdfFile && (
        <Button
          type="button"
          className="w-full"
          onClick={onApply}
          disabled={loading || (!text.trim() && !imageFile)}
        >
          {loading ? "Elaborazione..." : "Aggiungi watermark e scarica"}
        </Button>
      )}
    </div>
  );
}
