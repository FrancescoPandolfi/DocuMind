"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface ImagesToPdfPanelProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  onCreatePdf: () => void;
  loading: boolean;
  error: string | null;
}

export function ImagesToPdfPanel({
  images,
  onImagesChange,
  onCreatePdf,
  loading,
  error,
}: ImagesToPdfPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const arr = [...images];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    onImagesChange(arr);
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Immagini</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Trascina per riordinare (il primo in alto sarà la prima pagina)
        </p>
        <ul className="space-y-1">
          {images.map((file, i) => {
            const isDragging = draggedIndex === i;
            return (
              <li
                key={`${file.name}-${i}`}
                draggable
                onDragStart={() => setDraggedIndex(i)}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== i) {
                    reorderImages(draggedIndex, i);
                    setDraggedIndex(null);
                  }
                }}
                className={`flex cursor-grab items-center justify-between rounded-lg px-3 py-2 text-sm active:cursor-grabbing ${
                  isDragging ? "opacity-50" : "bg-muted"
                }`}
              >
                <span className="mr-2 shrink-0 text-muted-foreground" aria-hidden>
                  <GripVertical className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2 size-8 shrink-0 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  title="Rimuovi"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <Button
          type="button"
          className="w-full"
          onClick={onCreatePdf}
          disabled={loading}
        >
          {loading ? "Elaborazione..." : "Crea PDF e scarica"}
        </Button>
      )}
    </div>
  );
}
