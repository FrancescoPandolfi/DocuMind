"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { EditPanel } from "@/components/EditPanel";
import { EditToolbar } from "@/components/EditToolbar";
import { FileDrop } from "@/components/FileDrop";
import { TextFormatToolbar } from "@/components/TextFormatToolbar";
import { ShapeFormatToolbar } from "@/components/ShapeFormatToolbar";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import type { Overlay, TextOverlay, ImageOverlay, ShapeOverlay } from "@/lib/pdf-service";

async function getImageAspectRatio(file: File): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth / img.naturalHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(1);
    };
    img.src = url;
  });
}

const PdfPreview = dynamic(() => import("@/components/PdfPreview").then((m) => ({ default: m.PdfPreview })), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border bg-card">
      <p className="text-slate-500">Caricamento anteprima...</p>
    </div>
  ),
});

export default function EditPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"text" | "image" | "shape" | null>(null);

  const handleOverlayMove = (overlayId: string, x: number, y: number) => {
    setOverlays((prev) =>
      prev.map((o) => {
        const id = "id" in o ? o.id : undefined;
        if (id === overlayId) return { ...o, x, y };
        return o;
      })
    );
  };

  const handleOverlayResize = (overlayId: string, width: number, height: number) => {
    setOverlays((prev) =>
      prev.map((o) => {
        const id = "id" in o ? o.id : undefined;
        if (id === overlayId && (o.type === "image" || o.type === "shape"))
          return { ...o, width, height };
        return o;
      })
    );
  };

  const handleRemoveOverlay = (overlayId: string) => {
    setOverlays((prev) => prev.filter((o) => ("id" in o ? o.id !== overlayId : true)));
    if (selectedOverlayId === overlayId) setSelectedOverlayId(null);
  };

  const handleOverlayUpdate = (
    overlayId: string,
    updates: Partial<TextOverlay> | Partial<ShapeOverlay>
  ) => {
    setOverlays((prev) =>
      prev.map((o) => {
        const id = "id" in o ? o.id : undefined;
        if (id === overlayId && (o.type === "text" || o.type === "shape"))
          return { ...o, ...updates } as Overlay;
        return o;
      })
    );
  };

  const handleApply = async () => {
    if (!pdfFile || overlays.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("overlays", JSON.stringify(overlays));
      for (const img of images) {
        formData.append("images", img);
      }

      const res = await fetch("/api/edit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore durante la modifica");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageLayout title="Modifica PDF">
        <div className="grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-0 lg:grid-cols-3">
          <div className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col overflow-hidden rounded-t-xl border border-r-0 border-border bg-muted/30 lg:rounded-r-none lg:rounded-l-xl lg:col-span-2">
            {!pdfFile ? (
              <FileDrop
                onDrop={(files) => {
                  const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
                  if (pdf) setPdfFile(pdf);
                }}
                accept=".pdf"
                multiple={false}
                className="min-h-[calc(100vh-14rem)] flex-1"
              >
                <p className="text-center text-muted-foreground">
                  Trascina un PDF qui o clicca per selezionare
                </p>
              </FileDrop>
            ) : (
            <>
            <div className="shrink-0 border-b border-border">
              <div className="relative min-h-[52px]">
                <div className="p-3">
                  <EditToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    hasPdf={!!pdfFile}
                    onAddText={() => {
                      const overlay: import("@/lib/pdf-service").TextOverlay = {
                        type: "text",
                        id: `text-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        page: currentPage,
                        x: 15,
                        y: 85,
                        content: "Nuovo testo",
                        size: 12,
                      };
                      setOverlays((prev) => [...prev, overlay]);
                      setSelectedOverlayId(overlay.id!);
                    }}
                    onAddShape={() => {
                      const overlay: import("@/lib/pdf-service").ShapeOverlay = {
                        type: "shape",
                        id: `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        shape: "rect",
                        page: currentPage,
                        x: 15,
                        y: 75,
                        width: 20,
                        height: 15,
                        fillColor: { r: 0.9, g: 0.9, b: 0.9 },
                      };
                      setOverlays((prev) => [...prev, overlay]);
                      setSelectedOverlayId(overlay.id!);
                    }}
                    onImagesSelected={async (files) => {
                      const valid = files.filter(
                        (f) =>
                          f.name.toLowerCase().endsWith(".png") ||
                          f.name.toLowerCase().endsWith(".jpg") ||
                          f.name.toLowerCase().endsWith(".jpeg")
                      );
                      if (valid.length === 0) return;
                      let startIndex = 0;
                      setImages((prev) => {
                        startIndex = prev.length;
                        return [...prev, ...valid];
                      });
                      const ratios = await Promise.all(valid.map(getImageAspectRatio));
                      const newOverlays: ImageOverlay[] = valid.map((_, i) => ({
                        type: "image",
                        id: `img-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
                        imageIndex: startIndex + i,
                        page: currentPage,
                        x: 15,
                        y: 75,
                        width: 25,
                        height: 25 / ratios[i],
                        aspectRatio: ratios[i],
                      }));
                      setOverlays((prev) => [...prev, ...newOverlays]);
                    }}
                  />
                </div>
                {selectedOverlayId && (() => {
                  const o = overlays.find((x) => "id" in x && x.id === selectedOverlayId);
                  if (o?.type === "text") {
                    return (
                      <div className="absolute left-0 right-0 top-full z-10 bg-popover px-3 pb-3 pt-1 shadow-lg animate-slide-down backdrop-blur-sm border border-border rounded-md">
                        <TextFormatToolbar
                          text={o}
                          onUpdate={(updates) => handleOverlayUpdate(selectedOverlayId, updates)}
                          onDelete={() => handleRemoveOverlay(selectedOverlayId)}
                        />
                      </div>
                    );
                  }
                  if (o?.type === "shape") {
                    return (
                      <div className="absolute left-0 right-0 top-full z-10 bg-popover px-3 pb-3 pt-1 shadow-lg animate-slide-down backdrop-blur-sm border border-border rounded-md">
                        <ShapeFormatToolbar
                          shape={o}
                          onUpdate={(updates) => handleOverlayUpdate(selectedOverlayId, updates)}
                          onDelete={() => handleRemoveOverlay(selectedOverlayId)}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <PdfPreview
                file={pdfFile}
                currentPage={currentPage}
                overlays={overlays}
                images={images}
                onPageChange={setCurrentPage}
                onPageCount={setNumPages}
                onOverlayMove={handleOverlayMove}
                onOverlayResize={handleOverlayResize}
                onOverlaySelect={setSelectedOverlayId}
                selectedOverlayId={selectedOverlayId}
              />
            </div>
            </>
            )}
          </div>
          <div className="rounded-b-xl border border-border bg-sidebar p-6 lg:rounded-l-none lg:rounded-r-xl lg:border-l">
            <EditPanel
              pdfFile={pdfFile}
              overlays={overlays}
              images={images}
              onPdfChange={setPdfFile}
              onOverlaysChange={setOverlays}
              onApply={handleApply}
              loading={loading}
              error={error}
              numPages={numPages}
              currentPage={currentPage}
              selectedOverlayId={selectedOverlayId}
              onOverlaySelect={setSelectedOverlayId}
              onOverlayUpdate={handleOverlayUpdate}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
    </ToolPageLayout>
  );
}
