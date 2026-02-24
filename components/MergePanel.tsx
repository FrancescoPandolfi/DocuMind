"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface MergePanelProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onMerge: () => void;
  loading: boolean;
  error: string | null;
}

export function MergePanel({
  files,
  onFilesChange,
  onMerge,
  loading,
  error,
}: MergePanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const reorderFiles = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const arr = [...files];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    onFilesChange(arr);
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">PDF da unire</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Trascina per riordinare (il primo in alto sarà all&apos;inizio del documento)
        </p>
        <ul className="space-y-1">
          {files.map((file, i) => {
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
                    reorderFiles(draggedIndex, i);
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
                    removeFile(i);
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

      {files.length >= 2 && (
        <Button
          type="button"
          className="w-full"
          onClick={onMerge}
          disabled={loading}
        >
          {loading ? "Elaborazione..." : "Unisci e scarica"}
        </Button>
      )}
    </div>
  );
}
