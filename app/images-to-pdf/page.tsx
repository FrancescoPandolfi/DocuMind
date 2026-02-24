"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { FileDrop } from "@/components/FileDrop";
import { ImagesToPdfPanel } from "@/components/ImagesToPdfPanel";
import { ToolPageLayout } from "@/components/ToolPageLayout";

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

function ImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt=""
      className="max-h-[calc(100vh-16rem)] max-w-full object-contain"
    />
  );
}

export default function ImagesToPdfPage() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validExtensions = [".png", ".jpg", ".jpeg"];
  const isValidImage = (f: File) =>
    validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));

  const handleDrop = (files: File[]) => {
    const valid = files.filter(isValidImage);
    setImages((prev) => [...prev, ...valid].slice(0, 50));
    setError(null);
  };

  const handleImagesChange = (newImages: File[]) => {
    setImages(newImages);
    if (selectedIndex >= newImages.length && newImages.length > 0) {
      setSelectedIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setSelectedIndex(0);
    }
  };

  const handleCreatePdf = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const img of images) {
        formData.append("images", img);
      }

      const res = await fetch("/api/images-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Errore");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const selectedImage = images[selectedIndex];

  return (
    <ToolPageLayout title="Immagini in PDF">
      <div
        className={`grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-0 ${images.length > 0 ? "lg:grid-cols-3" : ""}`}
      >
        <div className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col overflow-hidden rounded-t-xl border border-r-0 border-border bg-muted/30 lg:rounded-r-none lg:rounded-l-xl lg:col-span-2">
          {images.length === 0 ? (
            <FileDrop
              onDrop={handleDrop}
              accept=".png,.jpg,.jpeg"
              multiple
              maxFiles={50}
              className="min-h-[calc(100vh-14rem)] flex-1"
            >
              <p className="text-center text-muted-foreground">
                Trascina le immagini qui o clicca per selezionare (PNG, JPG)
              </p>
            </FileDrop>
          ) : (
            <>
              <div className="shrink-0 border-b border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {images.map((file, i) => (
                    <button
                      key={`${file.name}-${i}`}
                      type="button"
                      onClick={() => setSelectedIndex(i)}
                      className={`relative h-12 w-12 overflow-hidden rounded-lg border transition-all ${
                        selectedIndex === i
                          ? "border-primary ring-2 ring-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <ImageThumbnail file={file} />
                    </button>
                  ))}
                  {images.length < 50 && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files ?? []);
                          const valid = newFiles.filter(isValidImage);
                          if (valid.length > 0) handleDrop(valid);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                      >
                        <Plus className="size-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
                {selectedImage && (
                  <div className="relative max-h-full max-w-full overflow-hidden rounded-xl border border-border bg-white dark:bg-neutral-100">
                    <ImagePreview file={selectedImage} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {images.length > 0 && (
          <div className="rounded-b-xl border border-border bg-sidebar p-6 lg:rounded-l-none lg:rounded-r-xl lg:border-l">
            <ImagesToPdfPanel
              images={images}
              onImagesChange={handleImagesChange}
              onCreatePdf={handleCreatePdf}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
