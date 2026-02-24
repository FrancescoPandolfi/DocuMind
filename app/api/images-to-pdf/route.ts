import { NextRequest, NextResponse } from "next/server";
import { imagesToPdf } from "@/lib/pdf-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nessuna immagine caricata" },
        { status: 400 }
      );
    }

    const buffers: Buffer[] = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      const name = file.name.toLowerCase();
      if (
        !name.endsWith(".png") &&
        !name.endsWith(".jpg") &&
        !name.endsWith(".jpeg")
      ) {
        return NextResponse.json(
          { error: `File non valido: ${file.name}. Solo PNG e JPG accettati.` },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      buffers.push(Buffer.from(arrayBuffer));
    }

    if (buffers.length === 0) {
      return NextResponse.json(
        { error: "Nessuna immagine valida caricata" },
        { status: 400 }
      );
    }

    const result = await imagesToPdf(buffers);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error("Images to PDF error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del PDF" },
      { status: 500 }
    );
  }
}
