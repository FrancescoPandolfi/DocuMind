import { NextRequest, NextResponse } from "next/server";
import {
  addPageNumbers,
  type PageNumberFormat,
  type PageNumberPosition,
} from "@/lib/pdf-service";

const VALID_FORMATS: PageNumberFormat[] = ["1", "1 / N", "Pagina 1"];
const VALID_POSITIONS: PageNumberPosition[] = [
  "bottom-center",
  "bottom-right",
  "top-center",
  "top-right",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "1 / N";
    const position = (formData.get("position") as string) || "bottom-center";

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await addPageNumbers(buffer, {
      format: VALID_FORMATS.includes(format as PageNumberFormat)
        ? (format as PageNumberFormat)
        : "1 / N",
      position: VALID_POSITIONS.includes(position as PageNumberPosition)
        ? (position as PageNumberPosition)
        : "bottom-center",
    });

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="numbered.pdf"',
      },
    });
  } catch (error) {
    console.error("Page numbers error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiunta della numerazione" },
      { status: 500 }
    );
  }
}
