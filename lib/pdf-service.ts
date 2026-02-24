import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";

export type TextFont = "helvetica" | "helvetica-bold" | "helvetica-oblique" | "helvetica-bold-oblique";

export type TextOverlay = {
  type: "text";
  id?: string;
  page: number;
  x: number;
  y: number;
  content: string;
  size?: number;
  font?: TextFont;
  color?: { r: number; g: number; b: number };
};

export type ImageOverlay = {
  type: "image";
  id?: string;
  imageIndex: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Aspect ratio (width/height) per mantenere proporzioni al resize */
  aspectRatio?: number;
};

export type ShapeOverlay = {
  type: "shape";
  id?: string;
  shape: "rect" | "circle";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Colore di riempimento (0–1) */
  fillColor?: { r: number; g: number; b: number };
};

export type Overlay = TextOverlay | ImageOverlay | ShapeOverlay;

function isPng(buffer: Buffer): boolean {
  return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e;
}

export async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return Buffer.from(pdfBytes);
}

export async function splitPdf(
  buffer: Buffer,
  pageRanges: number[][]
): Promise<Buffer[]> {
  const pdf = await PDFDocument.load(buffer);
  const results: Buffer[] = [];

  for (const [start, end] of pageRanges) {
    const newPdf = await PDFDocument.create();
    const indices = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i - 1
    );
    const pages = await newPdf.copyPages(pdf, indices);
    for (const page of pages) {
      newPdf.addPage(page);
    }
    results.push(Buffer.from(await newPdf.save()));
  }

  return results;
}

export async function extractPages(
  buffer: Buffer,
  pages: number[]
): Promise<Buffer> {
  const pdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();
  const indices = pages.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(pdf, indices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }
  return Buffer.from(await newPdf.save());
}

export async function rotatePages(
  buffer: Buffer,
  pages: number[],
  angle: number
): Promise<Buffer> {
  const pdf = await PDFDocument.load(buffer);
  const toRotate =
    pages.length === 0
      ? new Set(pdf.getPageIndices())
      : new Set(pages.map((p) => p - 1));

  for (const i of pdf.getPageIndices()) {
    if (toRotate.has(i)) {
      pdf.getPage(i).setRotation(degrees(angle));
    }
  }

  return Buffer.from(await pdf.save());
}

export async function removePages(
  buffer: Buffer,
  pagesToRemove: number[]
): Promise<Buffer> {
  const pdf = await PDFDocument.load(buffer);
  const removeSet = new Set(pagesToRemove.map((p) => p - 1));
  const indices = pdf
    .getPageIndices()
    .filter((i) => !removeSet.has(i));

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, indices);
  for (const page of pages) {
    newPdf.addPage(page);
  }
  return Buffer.from(await newPdf.save());
}

const FONT_MAP: Record<string, keyof typeof StandardFonts> = {
  helvetica: "Helvetica",
  "helvetica-bold": "HelveticaBold",
  "helvetica-oblique": "HelveticaOblique",
  "helvetica-bold-oblique": "HelveticaBoldOblique",
};

export async function editPdf(
  pdfBuffer: Buffer,
  overlays: Overlay[],
  imageBuffers: Buffer[]
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const fonts: Record<string, Awaited<ReturnType<PDFDocument["embedFont"]>>> = {};
  for (const key of Object.keys(FONT_MAP)) {
    fonts[key] = await pdf.embedFont(StandardFonts[FONT_MAP[key]]);
  }
  const defaultFont = fonts.helvetica;

  const embeddedImages: Awaited<ReturnType<PDFDocument["embedPng"]>>[] = [];
  for (const buf of imageBuffers) {
    const bytes = new Uint8Array(buf);
    if (isPng(buf)) {
      embeddedImages.push(await pdf.embedPng(bytes));
    } else {
      embeddedImages.push(await pdf.embedJpg(bytes));
    }
  }

  for (const overlay of [...overlays].reverse()) {
    const pageIndex = overlay.page - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) continue;

    const page = pdf.getPage(pageIndex);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    if (overlay.type === "text") {
      const size = overlay.size ?? 12;
      const borderPx = 1;
      const pxToPt = 72 / 96;
      const x = (pageWidth * overlay.x) / 100 + borderPx * pxToPt;
      const y = (pageHeight * overlay.y) / 100 + borderPx * pxToPt;
      const fontKey = overlay.font ?? "helvetica";
      const font = fonts[fontKey] ?? defaultFont;
      const c = overlay.color ?? { r: 0, g: 0, b: 0 };
      page.drawText(overlay.content, {
        x,
        y,
        size,
        font,
        color: rgb(c.r, c.g, c.b),
      });
    } else if (overlay.type === "image") {
      const img = embeddedImages[overlay.imageIndex];
      if (!img) continue;
      const borderPx = 1;
      const pxToPt = 72 / 96;
      const x = (pageWidth * overlay.x) / 100 + borderPx * pxToPt;
      const y = (pageHeight * overlay.y) / 100 + borderPx * pxToPt;
      const boxWidth = (pageWidth * overlay.width) / 100;
      const boxHeight = (pageHeight * overlay.height) / 100;
      const aspectRatio = overlay.aspectRatio ?? overlay.width / overlay.height;
      let drawWidth: number;
      let drawHeight: number;
      if (boxWidth / boxHeight > aspectRatio) {
        drawHeight = boxHeight;
        drawWidth = boxHeight * aspectRatio;
      } else {
        drawWidth = boxWidth;
        drawHeight = boxWidth / aspectRatio;
      }
      page.drawImage(img, { x, y, width: drawWidth, height: drawHeight });
    } else if (overlay.type === "shape") {
      const borderPx = 1;
      const pxToPt = 72 / 96;
      const x = (pageWidth * overlay.x) / 100 + borderPx * pxToPt;
      const y = (pageHeight * overlay.y) / 100 + borderPx * pxToPt;
      const width = (pageWidth * overlay.width) / 100;
      const height = (pageHeight * overlay.height) / 100;
      const fill = overlay.fillColor ?? { r: 0.9, g: 0.9, b: 0.9 };
      const fillRgb = rgb(fill.r, fill.g, fill.b);

      if (overlay.shape === "rect") {
        page.drawRectangle({
          x,
          y,
          width,
          height,
          color: fillRgb,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      } else if (overlay.shape === "circle") {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const radius = Math.min(width, height) / 2; // pdf-lib size = radius
        page.drawCircle({
          x: cx,
          y: cy,
          size: radius,
          color: fillRgb,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      }
    }
  }

  return Buffer.from(await pdf.save());
}
