"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { FileDrop } from "@/components/FileDrop";
import { RotatePanel } from "@/components/RotatePanel";
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

export default function RotatePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [angle, setAngle] = useState(90);
  const [rotateAll, setRotateAll] = useState(true);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (files: File[]) => {
    const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
    setPdfFile(pdf ?? null);
    setCurrentPage(1);
    setSelectedPages(new Set());
    setError(null);
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const pagesToRotate = rotateAll
    ? "all"
    : Array.from(selectedPages)
        .sort((a, b) => a - b)
        .join(", ");

  const previewRotation =
    rotateAll || selectedPages.has(currentPage) ? angle : undefined;

  const handleRotate = async () => {
    if (!pdfFile) return;
    if (!rotateAll && selectedPages.size === 0) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("pages", pagesToRotate);
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
    <ToolPageLayout title="Ruota pagine">
      <div
        className={`grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-0 ${pdfFile ? "lg:grid-cols-3" : ""}`}
      >
        <div className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col overflow-hidden rounded-t-xl border border-r-0 border-border bg-muted/30 lg:rounded-r-none lg:rounded-l-xl lg:col-span-2">
          {!pdfFile ? (
            <FileDrop
              onDrop={handleDrop}
              accept=".pdf"
              multiple={false}
              className="min-h-[calc(100vh-14rem)] flex-1"
            >
              <p className="text-center text-muted-foreground">
                Trascina un PDF qui o clicca per selezionare
              </p>
            </FileDrop>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <PdfPreview
                file={pdfFile}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageCount={setNumPages}
                pageRotation={previewRotation}
              />
            </div>
          )}
        </div>
        {pdfFile && (
          <div className="rounded-b-xl border border-border bg-sidebar p-6 lg:rounded-l-none lg:rounded-r-xl lg:border-l">
            <RotatePanel
              pdfFile={pdfFile}
              onPdfChange={setPdfFile}
              angle={angle}
              onAngleChange={setAngle}
              numPages={numPages}
              rotateAll={rotateAll}
              onRotateAllChange={setRotateAll}
              selectedPages={selectedPages}
              onTogglePage={togglePage}
              onRotate={handleRotate}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
