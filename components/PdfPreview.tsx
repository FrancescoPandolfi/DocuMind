"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Overlay, TextOverlay, ImageOverlay, ShapeOverlay } from "@/lib/pdf-service";

function ImageThumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={url} alt="" className="h-full w-full object-contain" />
  );
}

interface PageCanvasProps {
  file: File;
  pageNum: number;
  scale: number;
  onRendered?: (width: number, height: number) => void;
}

function PageCanvas({ file, pageNum, scale, onRendered }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        onRendered?.(viewport.width, viewport.height);

        await page.render({
          canvasContext: context,
          canvas,
          viewport,
        }).promise;
      } catch {
        // ignore
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [file, pageNum, scale, onRendered]);

  return <canvas ref={canvasRef} className="block w-full" style={{ display: "block" }} />;
}

interface PdfPreviewProps {
  file: File | null;
  currentPage?: number;
  overlays?: Overlay[];
  images?: File[];
  onPageChange?: (page: number) => void;
  onPageCount?: (count: number) => void;
  onOverlayMove?: (overlayId: string, x: number, y: number) => void;
  onOverlayResize?: (overlayId: string, width: number, height: number) => void;
  onOverlaySelect?: (overlayId: string | null) => void;
  selectedOverlayId?: string | null;
}

export function PdfPreview({
  file,
  currentPage = 1,
  overlays = [],
  images = [],
  onPageChange,
  onPageCount,
  onOverlayMove,
  onOverlayResize,
  onOverlaySelect,
  selectedOverlayId = null,
}: PdfPreviewProps) {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainPageSize, setMainPageSize] = useState({ width: 0, height: 0 });
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startOverlayX: number;
    startOverlayY: number;
  } | null>(null);
  const resizeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    aspectRatio?: number; // solo per immagini
  } | null>(null);
  const didDragRef = useRef(false);

  const thumbnailScale = 0.25;
  const [zoom, setZoom] = useState(1); // 1 = stessa scala del PDF (72 DPI)
  const mainScale = zoom;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    if (!file) {
      setNumPages(0);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;
        const count = pdf.numPages;
        setNumPages(count);
        onPageCount?.(count);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Errore caricamento PDF");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [file, onPageCount]);

  const handlePageRendered = useCallback((width: number, height: number) => {
    setMainPageSize({ width, height });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string) => {
      const pageOverlays = overlays.filter((o) => o.page === currentPage);
      const o = pageOverlays.find((x) => (x as { id?: string }).id === overlayId);
      if (!o) return;
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
      dragRef.current = {
        id: overlayId,
        startX: e.clientX,
        startY: e.clientY,
        startOverlayX: o.x,
        startOverlayY: o.y,
      };
    },
    [overlays, currentPage]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string, isShape?: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      const pageOverlays = overlays.filter((o) => o.page === currentPage);
      const o = pageOverlays.find((x) => (x as { id?: string }).id === overlayId);
      if (!o) return;
      if (o.type === "image") {
        const img = o as ImageOverlay;
        const ar = img.aspectRatio ?? img.width / img.height;
        resizeRef.current = {
          id: overlayId,
          startX: e.clientX,
          startY: e.clientY,
          startW: img.width,
          startH: img.height,
          aspectRatio: ar,
        };
      } else if (o.type === "shape" && isShape) {
        const s = o as ShapeOverlay;
        resizeRef.current = {
          id: overlayId,
          startX: e.clientX,
          startY: e.clientY,
          startW: s.width,
          startH: s.height,
        };
      }
    },
    [overlays, currentPage]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const r = resizeRef.current;
      if (r && onOverlayResize) {
        const container = mainContainerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;
        let newW: number;
        let newH: number;
        if (r.aspectRatio != null) {
          newW = Math.max(2, Math.min(100 - 1, r.startW + dxPercent));
          newH = newW / r.aspectRatio;
        } else {
          newW = Math.max(2, Math.min(100 - 1, r.startW + dxPercent));
          newH = Math.max(2, Math.min(100 - 1, r.startH - dyPercent));
        }
        onOverlayResize(r.id, newW, newH);
        r.startX = e.clientX;
        r.startY = e.clientY;
        r.startW = newW;
        r.startH = newH;
        return;
      }

      const d = dragRef.current;
      if (!d || !onOverlayMove) return;
      const container = mainContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const dxPercent = (dx / rect.width) * 100;
      const dyPercent = (dy / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, d.startOverlayX + dxPercent));
      const newY = Math.max(0, Math.min(100, d.startOverlayY - dyPercent));

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
      onOverlayMove(d.id, newX, newY);
      d.startX = e.clientX;
      d.startY = e.clientY;
      d.startOverlayX = newX;
      d.startOverlayY = newY;
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      const d = dragRef.current;
      if (d && !didDragRef.current && onOverlaySelect) {
        onOverlaySelect(d.id);
      }
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onOverlayMove, onOverlayResize, onOverlaySelect]);

  if (!file) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
        <p className="text-muted-foreground">Carica un PDF per vedere l&apos;anteprima</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const pageOverlays = overlays.filter((o) => o.page === currentPage);

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      {/* Left: thumbnails */}
      <div className="flex w-24 shrink-0 flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-card p-2">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
          const isCurrentPage = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange?.(pageNum)}
              className={`relative overflow-hidden rounded-lg border bg-white transition-all ${
                isCurrentPage
                  ? "border-neutral-500 ring-2 ring-neutral-500/50"
                  : "border-neutral-400/50 hover:border-neutral-500/50"
              }`}
            >
              <PageCanvas file={file} pageNum={pageNum} scale={thumbnailScale} />
              <div className="absolute bottom-0.5 left-0.5 rounded bg-slate-900/80 px-1 py-0.5 text-[10px] text-white">
                {pageNum}
              </div>
            </button>
          );
        })}
      </div>

      {/* Center: selected page */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-start overflow-auto">
        <div className="mb-2 flex w-full max-w-full items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Zoom out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Zoom in"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <div
          ref={mainContainerRef}
          className="relative shrink-0 rounded-xl border border-border bg-white dark:bg-neutral-100"
          style={
            mainPageSize.width > 0
              ? {
                  width: mainPageSize.width,
                  height: mainPageSize.height,
                }
              : undefined
          }
        >
          <PageCanvas
            file={file}
            pageNum={currentPage}
            scale={mainScale}
            onRendered={handlePageRendered}
          />
          {mainPageSize.width > 0 && mainPageSize.height > 0 && (
            <div
              className="absolute inset-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) onOverlaySelect?.(null);
              }}
            >
              {[...pageOverlays].reverse().map((overlay) => {
                if (overlay.type === "text") {
                  const t = overlay as TextOverlay & { id?: string };
                  const id = t.id ?? `text-${t.page}-${t.x}-${t.y}`;
                  const isSelected = selectedOverlayId === id;
                  const c = t.color ?? { r: 0, g: 0, b: 0 };
                  const fontStyle =
                    t.font === "helvetica-bold"
                      ? "font-bold"
                      : t.font === "helvetica-oblique"
                        ? "italic"
                        : t.font === "helvetica-bold-oblique"
                          ? "font-bold italic"
                          : "";
                  return (
                    <div
                      key={id}
                      className={`pointer-events-auto absolute cursor-move select-none whitespace-nowrap border px-1 pt-1 pb-0 ${fontStyle} ${
                        isSelected
                          ? "border-neutral-600 bg-neutral-200/80 ring-2 ring-neutral-500/60"
                          : "border-neutral-400/60 bg-neutral-100/80"
                      }`}
                      style={{
                        left: `${t.x}%`,
                        bottom: `${t.y}%`,
                        fontSize: t.size ?? 12,
                        color: `rgb(${c.r * 255},${c.g * 255},${c.b * 255})`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, id);
                      }}
                    >
                      {t.content}
                    </div>
                  );
                }
                if (overlay.type === "image" && images[overlay.imageIndex]) {
                  const img = overlay as ImageOverlay & { id?: string };
                  const id = img.id ?? `img-${img.page}-${img.imageIndex}`;
                  const isSelected = selectedOverlayId === id;
                  return (
                    <div
                      key={id}
                      className={`absolute cursor-move overflow-hidden border bg-slate-100 ${
                        isSelected ? "border-neutral-600 ring-2 ring-neutral-500/60" : "border-neutral-400/60"
                      }`}
                      style={{
                        left: `${img.x}%`,
                        bottom: `${img.y}%`,
                        width: `${Math.max(2, img.width)}%`,
                        height: `${Math.max(2, img.height)}%`,
                        minWidth: 24,
                        minHeight: 24,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, id);
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageThumbnail file={images[img.imageIndex]} />
                      </div>
                      {isSelected && onOverlayResize && (
                        <div
                          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize border-2 border-neutral-600 bg-white"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleResizeMouseDown(e, id);
                          }}
                        />
                      )}
                    </div>
                  );
                }
                if (overlay.type === "shape") {
                  const s = overlay as ShapeOverlay & { id?: string };
                  const id = s.id ?? `shape-${s.page}-${s.x}-${s.y}`;
                  const isSelected = selectedOverlayId === id;
                  const fill = s.fillColor ?? { r: 0.9, g: 0.9, b: 0.9 };
                  const fillCss = `rgb(${fill.r * 255},${fill.g * 255},${fill.b * 255})`;
                  return (
                    <div
                      key={id}
                      className={`pointer-events-auto absolute cursor-move border ${
                        isSelected ? "border-neutral-600 ring-2 ring-neutral-500/60" : "border-neutral-400/60"
                      }`}
                      style={{
                        left: `${s.x}%`,
                        bottom: `${s.y}%`,
                        width: `${Math.max(2, s.width)}%`,
                        height: `${Math.max(2, s.height)}%`,
                        minWidth: 24,
                        minHeight: 24,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, id);
                      }}
                    >
                      <div
                        className={`h-full w-full ${s.shape === "circle" ? "rounded-full" : ""}`}
                        style={{ backgroundColor: fillCss }}
                      />
                      {isSelected && onOverlayResize && (
                        <div
                          className="absolute -bottom-2 -right-2 h-4 w-4 shrink-0 cursor-se-resize border-2 border-neutral-600 bg-white"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleResizeMouseDown(e, id, true);
                          }}
                        />
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
