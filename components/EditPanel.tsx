"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Overlay, TextOverlay, ImageOverlay, ShapeOverlay } from "@/lib/pdf-service";

interface EditPanelProps {
  pdfFile: File | null;
  overlays: Overlay[];
  images: File[];
  onPdfChange: (file: File | null) => void;
  onOverlaysChange: (overlays: Overlay[]) => void;
  onApply: () => void;
  loading: boolean;
  error: string | null;
  numPages: number;
  currentPage?: number;
  selectedOverlayId?: string | null;
  onOverlaySelect?: (id: string | null) => void;
  onOverlayUpdate?: (
    id: string,
    updates: Partial<TextOverlay> | Partial<ShapeOverlay>
  ) => void;
  onPageChange?: (page: number) => void;
}

export function EditPanel({
  pdfFile,
  overlays,
  images,
  onPdfChange,
  onOverlaysChange,
  onApply,
  loading,
  error,
  numPages,
  currentPage = 1,
  selectedOverlayId = null,
  onOverlaySelect,
  onOverlayUpdate,
  onPageChange,
}: EditPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const removeOverlay = (index: number) => {
    const o = overlays[index];
    const id = "id" in o ? o.id : undefined;
    if (id === selectedOverlayId) onOverlaySelect?.(null);
    onOverlaysChange(overlays.filter((_, i) => i !== index));
  };

  const reorderOverlays = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const arr = [...overlays];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    onOverlaysChange(arr);
  };

  const selectedOverlay = selectedOverlayId
    ? overlays.find((o) => ("id" in o ? o.id === selectedOverlayId : false))
    : null;

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

      {selectedOverlay?.type === "image" && selectedOverlayId && (
        <section className="rounded-lg border border-border bg-muted p-3">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Immagine selezionata</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOverlaySelect?.(null)}
            >
              Chiudi
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => {
                const idx = overlays.findIndex(
                  (o) => "id" in o && o.id === selectedOverlayId
                );
                if (idx >= 0) removeOverlay(idx);
              }}
            >
              Elimina
            </Button>
          </div>
        </section>
      )}

      {overlays.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Elementi aggiunti ({overlays.length})
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">Trascina per riordinare (il primo sta sopra, l&apos;ultimo sotto)</p>
          <ul className="space-y-1">
            {overlays.map((o, i) => {
              const id =
                o.type === "text"
                  ? (o as TextOverlay).id ?? `text-${o.page}-${o.x}-${o.y}`
                  : o.type === "image"
                    ? (o as ImageOverlay).id ?? `img-${o.page}-${(o as ImageOverlay).imageIndex}`
                    : (o as ShapeOverlay).id ?? `shape-${o.page}-${o.x}-${o.y}`;
              const isSelected = id === selectedOverlayId;
              const isDragging = draggedIndex === i;
              return (
                <li
                  key={id}
                  draggable
                  onDragStart={() => setDraggedIndex(i)}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== i) {
                      reorderOverlays(draggedIndex, i);
                      setDraggedIndex(null);
                    }
                  }}
                  className={`flex cursor-grab items-center justify-between rounded-lg px-3 py-2 text-sm active:cursor-grabbing ${
                    isSelected ? "bg-accent ring-1 ring-border" : "bg-muted"
                  } ${isDragging ? "opacity-50" : ""}`}
                >
                  <span className="mr-2 shrink-0 text-muted-foreground" aria-hidden>
                    ⋮⋮
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 truncate text-left font-normal"
                    onClick={() => {
                      onOverlaySelect?.(id);
                      onPageChange?.(o.page);
                    }}
                  >
                    {o.type === "text"
                      ? `"${o.content}" p.${o.page}`
                      : o.type === "image"
                        ? `Immagine p.${o.page}`
                        : `Forma (${(o as ShapeOverlay).shape}) p.${o.page}`}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-2 size-8 shrink-0 text-destructive hover:bg-destructive/20 hover:text-destructive"
                    title="Rimuovi"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOverlay(i);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={onApply}
        disabled={loading || !pdfFile || overlays.length === 0}
      >
        {loading ? "Elaborazione..." : "Applica e scarica"}
      </Button>
    </div>
  );
}
