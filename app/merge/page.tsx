"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Plus } from "lucide-react";
import { FileDrop } from "@/components/FileDrop";
import { MergePanel } from "@/components/MergePanel";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const PdfPreview = dynamic(
  () => import("@/components/PdfPreview").then((m) => ({ default: m.PdfPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Caricamento anteprima...</p>
      </div>
    ),
  }
);

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFile = files[selectedIndex] ?? files[0] ?? null;

  const handleDrop = (newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setFiles((prev) => {
      const combined = [...prev, ...pdfs].slice(0, 10);
      if (combined.length > 0 && selectedIndex >= combined.length) {
        setSelectedIndex(0);
      }
      return combined;
    });
    setCurrentPage(1);
    setError(null);
  };

  const handleFilesChange = (newFiles: File[]) => {
    const prevSelected = files[selectedIndex];
    setFiles(newFiles);
    setCurrentPage(1);
    if (newFiles.length === 0) {
      setSelectedIndex(0);
    } else if (prevSelected) {
      const newIndex = newFiles.findIndex((f) => f.name === prevSelected.name && f.size === prevSelected.size);
      setSelectedIndex(newIndex >= 0 ? newIndex : Math.min(selectedIndex, newFiles.length - 1));
    } else if (selectedIndex >= newFiles.length) {
      setSelectedIndex(newFiles.length - 1);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

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
    <ToolPageLayout title="Unisci PDF">
      <div
        className={`grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-0 ${files.length > 0 ? "lg:grid-cols-3" : ""}`}
      >
        <div className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col overflow-hidden rounded-t-xl border border-r-0 border-border bg-muted/30 lg:rounded-r-none lg:rounded-l-xl lg:col-span-2">
          {files.length === 0 ? (
            <FileDrop
              onDrop={handleDrop}
              accept=".pdf"
              multiple
              maxFiles={10}
              className="min-h-[calc(100vh-14rem)] flex-1"
            >
              <p className="text-center text-muted-foreground">
                Trascina i PDF qui o clicca per selezionare
              </p>
            </FileDrop>
          ) : (
            <>
              <div className="shrink-0 border-b border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {files.map((file, i) => (
                    <button
                      key={`${file.name}-${i}`}
                      type="button"
                      onClick={() => {
                        setSelectedIndex(i);
                        setCurrentPage(1);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedIndex === i
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {file.name}
                    </button>
                  ))}
                  {files.length < 10 && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files ?? []);
                          const pdfs = newFiles.filter((f) =>
                            f.name.toLowerCase().endsWith(".pdf")
                          );
                          if (pdfs.length > 0) handleDrop(pdfs);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="size-4" />
                        Aggiungi PDF
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <PdfPreview
                  file={selectedFile}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
        {files.length > 0 && (
          <div className="rounded-b-xl border border-border bg-sidebar p-6 lg:rounded-l-none lg:rounded-r-xl lg:border-l">
            <MergePanel
              files={files}
              onFilesChange={handleFilesChange}
              onMerge={handleMerge}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
