import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

/**
 * Parse page string like "1, 3, 5-8" into array of page numbers [1, 3, 5, 6, 7, 8]
 */
export function parsePages(value: string): number[] {
  if (!value.trim()) return [];
  const result: number[] = [];
  const parts = value.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.toLowerCase() === "all") return [];

    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) result.push(i);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) result.push(num);
    }
  }

  return [...new Set(result)].sort((a, b) => a - b);
}

/**
 * Parse page string like "1-3, 4-6, 7-10" into array of ranges [[1,3], [4,6], [7,10]]
 */
export function parsePageRanges(value: string): number[][] {
  if (!value.trim()) return [];
  const result: number[][] = [];
  const parts = value.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        result.push([start, end]);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) result.push([num, num]);
    }
  }

  return result;
}
