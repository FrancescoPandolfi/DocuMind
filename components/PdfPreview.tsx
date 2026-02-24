"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Overlay, TextOverlay, ImageOverlay, ShapeOverlay } from "@/lib/pdf-service";

const THUMB_ITEM_HEIGHT = 112;
const THUMB_GAP = 8;
const THUMB_SCALE = 0.2;

type PDFDoc = import("pdfjs-dist").PDFDocumentProxy;

function ThumbnailCanvas({
  pdfDoc,
  pageNum,
  scale,
}: {
  pdfDoc: PDFDoc;
  pageNum: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

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
  }, [pdfDoc, pageNum, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="block max-h-full max-w-full object-contain"
      style={{ display: "block" }}
    />
  );
}

function ThumbnailSlot({
  pageNum,
  pdfDoc,
  isCurrentPage,
  onPageChange,
}: {
  pageNum: number;
  pdfDoc: PDFDoc | null;
  isCurrentPage: boolean;
  onPageChange?: (page: number) => void;
}) {
  return (
    <button
      type="button"
      data-page={pageNum}
      onClick={() => onPageChange?.(pageNum)}
      className={`relative flex h-full min-h-[80px] w-full min-w-[60px] items-center justify-center overflow-hidden rounded-lg border bg-white transition-all ${
        isCurrentPage
          ? "border-neutral-500 ring-2 ring-neutral-500/50"
          : "border-neutral-400/50 hover:border-neutral-500/50"
      }`}
    >
      {pdfDoc ? (
        <ThumbnailCanvas pdfDoc={pdfDoc} pageNum={pageNum} scale={THUMB_SCALE} />
      ) : (
        <span className="text-xs text-muted-foreground">{pageNum}</span>
      )}
      <div className="absolute bottom-0.5 left-0.5 rounded bg-slate-900/80 px-1 py-0.5 text-[10px] text-white">
        {pageNum}
      </div>
    </button>
  );
}

function VirtualizedThumbnails({
  numPages,
  pdfDoc,
  currentPage,
  onPageChange,
  containerRef,
}: {
  numPages: number;
  pdfDoc: PDFDoc | null;
  currentPage: number;
  onPageChange?: (page: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const itemHeight = THUMB_ITEM_HEIGHT + THUMB_GAP;
  const totalHeight = numPages * itemHeight;
  const BUFFER = 5;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || numPages === 0) return;

    const update = () => {
      const scrollTop = el.scrollTop;
      const containerHeight = el.clientHeight;
      let start = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER);
      let end = Math.min(
        numPages - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + BUFFER
      );
      const currentIdx = currentPage - 1;
      if (currentIdx >= 0 && currentIdx < numPages) {
        start = Math.min(start, currentIdx);
        end = Math.max(end, currentIdx);
      }
      setVisibleRange((prev) =>
        prev.start !== start || prev.end !== end ? { start, end } : prev
      );
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [numPages, currentPage, containerRef]);

  const items = [];
  for (let i = visibleRange.start; i <= visibleRange.end && i < numPages; i++) {
    const pageNum = i + 1;
    items.push(
      <div
        key={pageNum}
        className="w-full"
        style={{
          position: "absolute",
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: THUMB_ITEM_HEIGHT,
        }}
      >
        <ThumbnailSlot
          pageNum={pageNum}
          pdfDoc={pdfDoc}
          isCurrentPage={pageNum === currentPage}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  return (
    <div
      className="min-w-full"
      style={{ height: totalHeight, position: "relative", width: "100%" }}
    >
      {items}
    </div>
  );
}

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
  rotation?: number;
  onRendered?: (width: number, height: number) => void;
}

function PageCanvas({ file, pageNum, scale, rotation = 0, onRendered }: PageCanvasProps) {
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

        const viewport = page.getViewport({ scale, rotation });
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
  }, [file, pageNum, scale, rotation, onRendered]);

  return <canvas ref={canvasRef} className="block w-full" style={{ display: "block" }} />;
}

interface PdfPreviewProps {
  file: File | null;
  currentPage?: number;
  pageRotation?: number;
  overlays?: Overlay[];
  images?: File[];
  onPageChange?: (page: number) => void;
  onPageCount?: (count: number) => void;
  onOverlayMove?: (overlayId: string, x: number, y: number) => void;
  onOverlayResize?: (overlayId: string, width: number, height: number) => void;
  onOverlaySelect?: (overlayId: string | null) => void;
  onOverlayUpdate?: (overlayId: string, updates: Partial<TextOverlay> | Partial<ShapeOverlay>) => void;
  selectedOverlayId?: string | null;
}

export function PdfPreview({
  file,
  currentPage = 1,
  pageRotation,
  overlays = [],
  images = [],
  onPageChange,
  onPageCount,
  onOverlayMove,
  onOverlayResize,
  onOverlaySelect,
  onOverlayUpdate,
  selectedOverlayId = null,
}: PdfPreviewProps) {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDoc | null>(null);
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

  const [zoom, setZoom] = useState(1); // 1 = stessa scala del PDF (72 DPI)
  const mainScale = zoom;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;

  const [pageInputValue, setPageInputValue] = useState<string | null>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setNumPages(0);
      setPdfDoc(null);
      setError(null);
      return;
    }

    setPdfDoc(null);
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
        setPdfDoc(pdf);
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

  useEffect(() => {
    const container = thumbnailsRef.current;
    if (!container || !currentPage) return;
    const itemHeight = THUMB_ITEM_HEIGHT + THUMB_GAP;
    const targetTop = (currentPage - 1) * itemHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    if (targetTop < scrollTop || targetTop + itemHeight > scrollTop + clientHeight) {
      container.scrollTo({
        top: Math.max(0, targetTop - clientHeight / 2 + itemHeight / 2),
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string) => {
      const pageOverlays = overlays.filter((o) => o.page === currentPage);
      const o = pageOverlays.find((x) => (x as { id?: string }).id === overlayId);
      if (!o) return;
      // Don't start drag for selected text overlays - let click focus contenteditable for editing
      if (o.type === "text" && selectedOverlayId === overlayId) return;
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
    [overlays, currentPage, selectedOverlayId]
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
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Caricamento PDF...</p>
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
      {/* Left: thumbnails (virtualized - only ~30 visible at a time) */}
    <div
      ref={thumbnailsRef}
      className="flex w-32 shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card p-2"
      style={{ maxHeight: "calc(100vh - 12rem)" }}
    >
        <VirtualizedThumbnails
          numPages={numPages}
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          onPageChange={onPageChange}
          containerRef={thumbnailsRef}
        />
      </div>

      {/* Center: selected page */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-start overflow-auto">
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
            rotation={pageRotation}
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
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      className={`pointer-events-auto absolute cursor-move whitespace-nowrap border px-1 pt-1 pb-0 outline-none ${fontStyle} ${
                        isSelected
                          ? "cursor-text select-text border-neutral-600 bg-neutral-200/80 ring-2 ring-neutral-500/60"
                          : "select-none border-neutral-400/60 bg-neutral-100/80"
                      }`}
                      style={{
                        left: `${t.x}%`,
                        bottom: `${t.y}%`,
                        fontSize: `${(t.size ?? 12) * mainScale}px`,
                        color: `rgb(${c.r * 255},${c.g * 255},${c.b * 255})`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, id);
                      }}
                      onBlur={(e) => {
                        const newContent = (e.target as HTMLElement).innerText.trim();
                        if (newContent !== t.content && onOverlayUpdate) {
                          onOverlayUpdate(id, { content: newContent || " " });
                        }
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
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

      {/* Fixed menu at bottom center: zoom + pagination */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
          {/* Zoom */}
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
          <span className="min-w-16 text-center text-sm text-muted-foreground">
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

          <div className="h-6 w-px bg-border" aria-hidden />

          {/* Pagination */}
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || numPages === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Pagina precedente"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1">
            <Input
              ref={pageInputRef}
              type="number"
              min={1}
              max={numPages}
              value={pageInputValue ?? currentPage}
              onChange={(e) => setPageInputValue(e.target.value)}
              onFocus={() => setPageInputValue(String(currentPage))}
              onBlur={() => {
                const n = parseInt(pageInputValue ?? String(currentPage), 10);
                if (!Number.isNaN(n) && n >= 1 && n <= numPages) {
                  onPageChange?.(n);
                }
                setPageInputValue(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const n = parseInt(pageInputValue ?? String(currentPage), 10);
                  if (!Number.isNaN(n) && n >= 1 && n <= numPages) {
                    onPageChange?.(n);
                  }
                  setPageInputValue(null);
                  pageInputRef.current?.blur();
                }
              }}
              disabled={numPages === 0}
              className="h-8 w-20 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={`Pagina ${currentPage} di ${numPages}`}
            />
            <span className="text-sm text-muted-foreground">/ {numPages}</span>
          </div>
          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages || numPages === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Pagina successiva"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
