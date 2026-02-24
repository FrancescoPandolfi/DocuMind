import { NextRequest, NextResponse } from "next/server";
import { removePages } from "@/lib/pdf-service";
import { parsePages } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pagesStr = formData.get("pages") as string | null;

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    if (!pagesStr?.trim()) {
      return NextResponse.json(
        { error: "Inserisci le pagine da rimuovere (es. 2, 4, 6)" },
        { status: 400 }
      );
    }

    const pages = parsePages(pagesStr);
    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Formato pagine non valido" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await removePages(buffer, pages);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="removed.pdf"',
      },
    });
  } catch (error) {
    console.error("Remove error:", error);
    return NextResponse.json(
      { error: "Errore durante la rimozione" },
      { status: 500 }
    );
  }
}
