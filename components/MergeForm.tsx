"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDrop } from "./FileDrop";
import { OperationCard } from "./OperationCard";

interface MergeFormProps {
  showHeader?: boolean;
}

export function MergeForm({ showHeader = true }: MergeFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (newFiles: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...newFiles].filter((f) =>
        f.name.toLowerCase().endsWith(".pdf")
      );
      return combined.slice(0, 10);
    });
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Carica almeno 2 PDF da unire");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore durante l'unione");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OperationCard
      title="Unisci PDF"
      description="Combina più file PDF in un unico documento"
      showHeader={showHeader}
    >
      <div className="space-y-4">
        <FileDrop
          onDrop={handleDrop}
          accept=".pdf"
          multiple
          maxFiles={10}
        >
          <p className="text-center text-muted-foreground">
            Trascina i PDF qui o clicca per selezionare
          </p>
        </FileDrop>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              File selezionati ({files.length})
            </p>
            <ul className="space-y-1">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <span className="truncate text-foreground">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(i)}
                    className="ml-2 text-destructive hover:text-destructive"
                  >
                    Rimuovi
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="w-full"
          onClick={handleMerge}
          disabled={loading || files.length < 2}
        >
          {loading ? "Elaborazione..." : "Unisci PDF"}
        </Button>
      </div>
    </OperationCard>
  );
}
