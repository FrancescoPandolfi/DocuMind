import { NextRequest, NextResponse } from "next/server";
import {
  addWatermark,
  type WatermarkPosition,
} from "@/lib/pdf-service";

const VALID_POSITIONS: WatermarkPosition[] = [
  "center",
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = (formData.get("text") as string)?.trim() ?? "";
    const position = (formData.get("position") as string) || "center";
    const opacity = parseFloat((formData.get("opacity") as string) || "0.3");
    const image = formData.get("image") as File | null;

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    if (!text && (!image || !(image instanceof File))) {
      return NextResponse.json(
        { error: "Inserisci un testo o carica un'immagine come logo" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let imageBuffer: Buffer | undefined;
    if (image && image instanceof File && image.size > 0) {
      const ext = image.name.toLowerCase();
      if (ext.endsWith(".png") || ext.endsWith(".jpg") || ext.endsWith(".jpeg")) {
        imageBuffer = Buffer.from(await image.arrayBuffer());
      }
    }

    const result = await addWatermark(buffer, {
      text,
      position: VALID_POSITIONS.includes(position as WatermarkPosition)
        ? (position as WatermarkPosition)
        : "center",
      opacity: Number.isFinite(opacity) ? Math.max(0.1, Math.min(1, opacity)) : 0.3,
      imageBuffer,
    });

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
      },
    });
  } catch (error) {
    console.error("Watermark error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiunta del watermark" },
      { status: 500 }
    );
  }
}
