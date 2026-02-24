import { NextRequest, NextResponse } from "next/server";
import { protectPdf } from "@/lib/pdf-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userPassword = (formData.get("userPassword") as string)?.trim();
    const ownerPassword = (formData.get("ownerPassword") as string)?.trim() || undefined;

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Carica un file PDF valido" },
        { status: 400 }
      );
    }

    if (!userPassword || userPassword.length < 1) {
      return NextResponse.json(
        { error: "Inserisci una password" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await protectPdf(buffer, userPassword, ownerPassword);

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
      },
    });
  } catch (error) {
    console.error("Protect error:", error);
    return NextResponse.json(
      { error: "Errore durante la protezione" },
      { status: 500 }
    );
  }
}
