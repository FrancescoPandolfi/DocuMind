"use client";

import type { TextOverlay, TextFont } from "@/lib/pdf-service";
import { rgbToHex, hexToRgb } from "@/lib/utils";

interface TextFormatToolbarProps {
  text: TextOverlay;
  onUpdate: (updates: Partial<TextOverlay>) => void;
  onDelete: () => void;
}

const FONTS: { value: TextFont; label: string }[] = [
  { value: "helvetica", label: "Helvetica" },
  { value: "helvetica-bold", label: "Grassetto" },
  { value: "helvetica-oblique", label: "Corsivo" },
  { value: "helvetica-bold-oblique", label: "Grassetto corsivo" },
];

export function TextFormatToolbar({ text, onUpdate, onDelete }: TextFormatToolbarProps) {
  const tc = text.color ?? { r: 0, g: 0, b: 0 };
  const colorHex = rgbToHex(tc.r, tc.g, tc.b);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
      <select
        value={text.font ?? "helvetica"}
        onChange={(e) => onUpdate({ font: e.target.value as TextFont })}
        className="rounded border border-input bg-input px-2 py-1.5 text-sm text-foreground"
      >
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onUpdate({ size: Math.max(6, (text.size ?? 12) - 2) })}
          className="rounded border border-input bg-input p-1.5 text-muted-foreground hover:bg-accent"
          title="Riduci dimensione"
        >
          <span className="text-xs font-bold">A</span>
          <span className="ml-0.5 text-[10px]">▼</span>
        </button>
        <input
          type="number"
          min={6}
          max={72}
          value={text.size ?? 12}
          onChange={(e) => onUpdate({ size: Number(e.target.value) || 12 })}
          className="w-12 rounded border border-input bg-input px-1.5 py-1 text-center text-sm text-foreground"
        />
        <button
          type="button"
          onClick={() => onUpdate({ size: Math.min(72, (text.size ?? 12) + 2) })}
          className="rounded border border-input bg-input p-1.5 text-muted-foreground hover:bg-accent"
          title="Aumenta dimensione"
        >
          <span className="text-xs font-bold">A</span>
          <span className="ml-0.5 text-[10px]">▲</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs text-muted-foreground">Colore</span>
          <input
            type="color"
            value={colorHex}
            onChange={(e) => onUpdate({ color: hexToRgb(e.target.value) })}
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
