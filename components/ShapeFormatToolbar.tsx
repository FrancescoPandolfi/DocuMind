"use client";

import type { ShapeOverlay } from "@/lib/pdf-service";
import { rgbToHex, hexToRgb } from "@/lib/utils";

interface ShapeFormatToolbarProps {
  shape: ShapeOverlay;
  onUpdate: (updates: Partial<ShapeOverlay>) => void;
  onDelete: () => void;
}

export function ShapeFormatToolbar({ shape, onUpdate, onDelete }: ShapeFormatToolbarProps) {
  const fc = shape.fillColor ?? { r: 0.9, g: 0.9, b: 0.9 };
  const colorHex = rgbToHex(fc.r, fc.g, fc.b);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tipo</span>
        <select
          value={shape.shape}
          onChange={(e) => onUpdate({ shape: e.target.value as "rect" | "circle" })}
          className="rounded border border-input bg-input px-2 py-1.5 text-sm text-foreground"
        >
          <option value="rect">Rettangolo</option>
          <option value="circle">Cerchio</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs text-muted-foreground">Riempimento</span>
          <input
            type="color"
            value={colorHex}
            onChange={(e) => onUpdate({ fillColor: hexToRgb(e.target.value) })}
            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-border"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="ml-auto rounded border border-red-500/50 bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30"
        title="Elimina"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  );
}
