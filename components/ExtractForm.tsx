"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDrop } from "./FileDrop";
import { OperationCard } from "./OperationCard";
import { PageInput } from "./PageInput";

interface ExtractFormProps {
  showHeader?: boolean;
}

export function ExtractForm({ showHeader = true }: ExtractFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: File[]) => {
    const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFile(pdf ?? null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) {
      setError("Carica un PDF");
      return;
    }
    if (!pages.trim()) {
      setError("Inserisci le pagine (es. 1, 3, 5-8)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);

      const res = await fetch("/api/extract", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "extracted.pdf";
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
      title="Estrai pagine"
      description="Estrai pagine specifiche in un nuovo PDF"
      showHeader={showHeader}
    >
      <div className="space-y-4">
        <FileDrop onDrop={handleDrop} accept=".pdf" multiple={false}>
          <p className="text-center text-muted-foreground">
            {file ? file.name : "Trascina un PDF o clicca per selezionare"}
          </p>
        </FileDrop>
        <PageInput
          value={pages}
          onChange={setPages}
          placeholder="1, 3, 5-8"
          label="Pagine da estrarre"
        />
        {error && (
          <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          onClick={handleExtract}
          disabled={loading || !file}
        >
          {loading ? "Elaborazione..." : "Estrai"}
        </Button>
      </div>
    </OperationCard>
  );
}
