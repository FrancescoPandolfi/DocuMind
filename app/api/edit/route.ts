import { NextRequest, NextResponse } from "next/server";
import { editPdf, type Overlay } from "@/lib/pdf-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File | null;
    const overlaysStr = formData.get("overlays") as string | null;

    if (!pdfFile || !(pdfFile instanceof File) || !pdfFile.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    let overlays: Overlay[] = [];
    try {
      overlays = overlaysStr ? (JSON.parse(overlaysStr) as Overlay[]) : [];
    } catch {
      return NextResponse.json(
        { error: "Formato overlays non valido" },
        { status: 400 }
      );
    }

    const imageBuffers: Buffer[] = [];
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file instanceof File && (file.name.toLowerCase().endsWith(".png") || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg"))) {
        imageBuffers.push(Buffer.from(await file.arrayBuffer()));
      }
    }

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const result = await editPdf(pdfBuffer, overlays, imageBuffers);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="edited.pdf"',
      },
    });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Errore durante la modifica del PDF" },
      { status: 500 }
    );
  }
}
