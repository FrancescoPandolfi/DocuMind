import { NextRequest, NextResponse } from "next/server";
import { mergePdfs } from "@/lib/pdf-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    const buffers: Buffer[] = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json(
          { error: `File non valido: ${file.name}. Solo PDF accettati.` },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      buffers.push(Buffer.from(arrayBuffer));
    }

    if (buffers.length === 0) {
      return NextResponse.json(
        { error: "Nessun PDF valido caricato" },
        { status: 400 }
      );
    }

    const result = await mergePdfs(buffers);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json(
      { error: "Errore durante l'unione dei PDF" },
      { status: 500 }
    );
  }
}
