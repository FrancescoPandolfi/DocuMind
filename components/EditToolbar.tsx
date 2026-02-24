"use client";

import { useRef } from "react";
import { Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type EditTool = "text" | "image" | "shape" | null;

interface EditToolbarProps {
  activeTool: EditTool;
  onToolChange: (tool: EditTool) => void;
  hasPdf: boolean;
  onImagesSelected?: (files: File[]) => void;
  onAddText?: () => void;
  onAddShape?: () => void;
}

function TextIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-foreground" : "text-muted-foreground"}
    >
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}

function ImageIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-foreground" : "text-muted-foreground"}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function EditToolbar({ activeTool, onToolChange, hasPdf, onImagesSelected, onAddText, onAddShape }: EditToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImageClick = () => {
    if (!hasPdf) return;
    if (onImagesSelected) {
      fileInputRef.current?.click();
    } else {
      onToolChange(activeTool === "image" ? null : "image");
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter(
      (f) =>
        f.name.toLowerCase().endsWith(".png") ||
        f.name.toLowerCase().endsWith(".jpg") ||
        f.name.toLowerCase().endsWith(".jpeg")
    );
    if (valid.length > 0) {
      onImagesSelected?.(valid);
    }
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        multiple
        className="hidden"
        onChange={handleImageFilesChange}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              type="button"
              variant={activeTool === "text" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => (onAddText ? onAddText() : onToolChange(activeTool === "text" ? null : "text"))}
              disabled={!hasPdf}
            >
              <TextIcon active={activeTool === "text"} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Aggiungi testo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              type="button"
              variant={activeTool === "image" ? "secondary" : "ghost"}
              size="icon"
              onClick={handleAddImageClick}
              disabled={!hasPdf}
            >
              <ImageIcon active={activeTool === "image"} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Aggiungi immagine</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              type="button"
              variant={activeTool === "shape" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => (onAddShape ? onAddShape() : onToolChange(activeTool === "shape" ? null : "shape"))}
              disabled={!hasPdf}
            >
              <Shapes className={activeTool === "shape" ? "text-foreground" : "text-muted-foreground"} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Aggiungi forma</TooltipContent>
      </Tooltip>
    </div>
  );
}
