"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDrop } from "./FileDrop";
import { OperationCard } from "./OperationCard";
import { PageInput } from "./PageInput";

interface SplitFormProps {
  showHeader?: boolean;
}

export function SplitForm({ showHeader = true }: SplitFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: File[]) => {
    const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFile(pdf ?? null);
    setError(null);
  };

  const handleSplit = async () => {
    if (!file) {
      setError("Carica un PDF");
      return;
    }
    if (!pages.trim()) {
      setError("Inserisci gli intervalli (es. 1-3, 4-6)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);

      const res = await fetch("/api/split", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("content-type")?.includes("zip")
        ? "split.zip"
        : "split-1.pdf";
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
      title="Dividi PDF"
      description="Dividi un PDF in più file per intervalli di pagine"
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
          placeholder="1-3, 4-6, 7-10"
          label="Intervalli"
        />
        {error && (
          <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          onClick={handleSplit}
          disabled={loading || !file}
        >
          {loading ? "Elaborazione..." : "Dividi"}
        </Button>
      </div>
    </OperationCard>
  );
}
