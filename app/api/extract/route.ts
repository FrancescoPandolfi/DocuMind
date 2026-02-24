import { NextRequest, NextResponse } from "next/server";
import { extractPages } from "@/lib/pdf-service";
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
        { error: "Inserisci le pagine da estrarre (es. 1, 3, 5-8)" },
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
    const result = await extractPages(buffer, pages);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="extracted.pdf"',
      },
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Errore durante l'estrazione" },
      { status: 500 }
    );
  }
}
