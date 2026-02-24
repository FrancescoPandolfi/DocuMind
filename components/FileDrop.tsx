"use client";

import { useRef, useState } from "react";

interface FileDropProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  children?: React.ReactNode;
  className?: string;
}

export function FileDrop({
  onDrop,
  accept = ".pdf",
  multiple = true,
  maxFiles = 10,
  children,
  className = "",
}: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(multiple ? files.slice(0, maxFiles) : [files[0]]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onDrop(Array.from(files).slice(0, maxFiles));
    }
    e.target.value = "";
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex min-h-[120px] cursor-pointer flex-col items-center justify-center
        rounded-lg border-2 border-dashed p-6 transition-all
        ${isDragging ? "border-muted-foreground/50 bg-accent" : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {children ?? (
        <p className="text-center text-muted-foreground">
          Trascina i file qui o clicca per selezionare
        </p>
      )}
    </div>
  );
}
