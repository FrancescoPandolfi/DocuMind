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

export type CompressionLevel = "normal" | "high" | "maximum";

/** PDFSETTINGS per Ghostscript: screen=minimo, ebook=medio, printer=massima qualità */
const GS_PDFSETTINGS: Record<CompressionLevel, string> = {
  normal: "/printer",
  high: "/ebook",
  maximum: "/screen",
};

async function compressWithGhostscript(
  buffer: Buffer,
  level: CompressionLevel
): Promise<Buffer | null> {
  const { spawn } = await import("child_process");
  const settings = GS_PDFSETTINGS[level];

  return new Promise((resolve) => {
    const gs = spawn(
      "gs",
      [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        `-dPDFSETTINGS=${settings}`,
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-sOutputFile=-",
        "-",
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    const chunks: Buffer[] = [];
    gs.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    gs.stderr.on("data", () => {});

    const timeout = setTimeout(() => {
      gs.kill("SIGKILL");
      resolve(null);
    }, 60000);

    gs.on("error", () => {
      clearTimeout(timeout);
      resolve(null);
    });
    gs.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(Buffer.concat(chunks));
      else resolve(null);
    });

    gs.stdin.write(buffer);
    gs.stdin.end();
  });
}

export type CompressionResult = { buffer: Buffer; method: "ghostscript" | "fallback" };

export async function compressPdf(
  buffer: Buffer,
  level: CompressionLevel = "high"
): Promise<CompressionResult> {
  const gsResult = await compressWithGhostscript(buffer, level);
  if (gsResult && gsResult.length > 0) {
    return { buffer: gsResult, method: "ghostscript" };
  }

  const pdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pdf.getPageIndices());
  for (const page of pages) {
    newPdf.addPage(page);
  }
  const result = Buffer.from(await newPdf.save({ useObjectStreams: true }));
  const final = result.length < buffer.length ? result : buffer;
  return { buffer: final, method: "fallback" };
}

export async function protectPdf(
  buffer: Buffer,
  userPassword: string,
  ownerPassword?: string
): Promise<Buffer> {
  const { PDFDocument } = await import("pdf-lib-with-encrypt");
  const pdf = await PDFDocument.load(buffer);
  await pdf.encrypt({
    userPassword,
    ...(ownerPassword && { ownerPassword }),
  });
  return Buffer.from(await pdf.save());
}

export async function unprotectPdf(buffer: Buffer, password: string): Promise<Buffer> {
  const { PDFDocument } = await import("pdf-lib-with-encrypt");
  const pdf = await PDFDocument.load(buffer, { password });
  return Buffer.from(await pdf.save());
}

export type WatermarkPosition =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export type WatermarkOptions = {
  text: string;
  position?: WatermarkPosition;
  opacity?: number;
  imageBuffer?: Buffer;
};

function getWatermarkCoords(
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  position: WatermarkPosition
): { x: number; y: number } {
  const margin = 20;
  switch (position) {
    case "center":
      return {
        x: (pageWidth - textWidth) / 2,
        y: (pageHeight - textHeight) / 2,
      };
    case "bottom-right":
      return { x: pageWidth - textWidth - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: margin };
    case "top-right":
      return { x: pageWidth - textWidth - margin, y: pageHeight - textHeight - margin };
    case "top-left":
      return { x: margin, y: pageHeight - textHeight - margin };
    default:
      return { x: (pageWidth - textWidth) / 2, y: (pageHeight - textHeight) / 2 };
  }
}

export async function addWatermark(
  buffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const opacity = Math.max(0.1, Math.min(1, options.opacity ?? 0.3));
  const gray = 1 - opacity;
  const color = rgb(gray, gray, gray);
  const position = options.position ?? "center";
  const fontSize = 48;

  let embeddedImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
  if (options.imageBuffer && options.imageBuffer.length > 0) {
    const bytes = new Uint8Array(options.imageBuffer);
    embeddedImage = isPng(options.imageBuffer)
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);
  }

  const pages = pdf.getPages();
  for (const page of pages) {
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    if (embeddedImage) {
      const { width, height } = embeddedImage.scale(0.5);
      const maxDim = Math.min(pageWidth, pageHeight) * 0.4;
      const scale = Math.min(maxDim / width, maxDim / height, 1);
      const drawWidth = width * scale;
      const drawHeight = height * scale;
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;
      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
        opacity,
      });
    } else if (options.text.trim()) {
      const textWidth = font.widthOfTextAtSize(options.text, fontSize);
      const textHeight = fontSize * 1.2;
      const { x, y } = getWatermarkCoords(
        pageWidth,
        pageHeight,
        textWidth,
        textHeight,
        position
      );
      page.drawText(options.text, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    }
  }

  return Buffer.from(await pdf.save());
}

export type PageNumberFormat = "1" | "1 / N" | "Pagina 1";
export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "top-center"
  | "top-right";

export type PageNumberOptions = {
  format: PageNumberFormat;
  position: PageNumberPosition;
};

function getPageNumberCoords(
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  position: PageNumberPosition
): { x: number; y: number } {
  const margin = 20;
  switch (position) {
    case "bottom-center":
      return { x: (pageWidth - textWidth) / 2, y: margin };
    case "bottom-right":
      return { x: pageWidth - textWidth - margin, y: margin };
    case "top-center":
      return { x: (pageWidth - textWidth) / 2, y: pageHeight - textHeight - margin };
    case "top-right":
      return {
        x: pageWidth - textWidth - margin,
        y: pageHeight - textHeight - margin,
      };
    default:
      return { x: (pageWidth - textWidth) / 2, y: margin };
  }
}

export async function addPageNumbers(
  buffer: Buffer,
  options: PageNumberOptions
): Promise<Buffer> {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const total = pdf.getPageCount();

  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageNum = i + 1;
    let text: string;
    switch (options.format) {
      case "1 / N":
        text = `${pageNum} / ${total}`;
        break;
      case "Pagina 1":
        text = `Pagina ${pageNum}`;
        break;
      default:
        text = String(pageNum);
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize * 1.2;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const { x, y } = getPageNumberCoords(
      pageWidth,
      pageHeight,
      textWidth,
      textHeight,
      options.position
    );

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return Buffer.from(await pdf.save());
}

export async function imagesToPdf(imageBuffers: Buffer[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();

  for (const buf of imageBuffers) {
    const bytes = new Uint8Array(buf);
    const image = isPng(buf)
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

    const { width, height } = image.scale(1);
    const page = pdf.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  return Buffer.from(await pdf.save());
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
