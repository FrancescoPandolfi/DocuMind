import { NextRequest, NextResponse } from "next/server";
import { rotatePages } from "@/lib/pdf-service";
import { parsePages } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pagesStr = (formData.get("pages") as string | null)?.trim() ?? "";
    const angle = parseInt(formData.get("angle") as string ?? "90", 10);

    if (![90, 180, 270].includes(angle)) {
      return NextResponse.json(
        { error: "Angolo non valido (90, 180, 270)" },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    const pages =
      !pagesStr || pagesStr.toLowerCase() === "all"
        ? []
        : parsePages(pagesStr);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await rotatePages(buffer, pages, angle);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
      },
    });
  } catch (error) {
    console.error("Rotate error:", error);
    return NextResponse.json(
      { error: "Errore durante la rotazione" },
      { status: 500 }
    );
  }
}
