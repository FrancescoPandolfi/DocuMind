"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDrop } from "./FileDrop";
import { OperationCard } from "./OperationCard";
import { PageInput } from "./PageInput";

interface RotateFormProps {
  showHeader?: boolean;
}

export function RotateForm({ showHeader = true }: RotateFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [angle, setAngle] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: File[]) => {
    const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFile(pdf ?? null);
    setError(null);
  };

  const handleRotate = async () => {
    if (!file) {
      setError("Carica un PDF");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages.trim() || "all");
      formData.append("angle", String(angle));

      const res = await fetch("/api/rotate", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rotated.pdf";
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
      title="Ruota pagine"
      description="Ruota pagine di 90°, 180° o 270°"
      showHeader={showHeader}
    >
      <div className="space-y-4">
        <FileDrop onDrop={handleDrop} accept=".pdf" multiple={false}>
          <p className="text-center text-muted-foreground">
            {file ? file.name : "Trascina un PDF o clicca per selezionare"}
          </p>
        </FileDrop>
        <div className="space-y-2">
          <Label>Angolo</Label>
          <Select value={String(angle)} onValueChange={(v) => setAngle(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90°</SelectItem>
              <SelectItem value="180">180°</SelectItem>
              <SelectItem value="270">270°</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PageInput
          value={pages}
          onChange={setPages}
          placeholder="all o 1, 3, 5"
          label="Pagine (lascia vuoto per tutte)"
        />
        {error && (
          <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          onClick={handleRotate}
          disabled={loading || !file}
        >
          {loading ? "Elaborazione..." : "Ruota"}
        </Button>
      </div>
    </OperationCard>
  );
}
