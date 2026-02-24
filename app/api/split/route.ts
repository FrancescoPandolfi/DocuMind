import { NextRequest, NextResponse } from "next/server";
import { Writable } from "stream";
import { finished } from "stream/promises";
import archiver from "archiver";
import { splitPdf } from "@/lib/pdf-service";
import { parsePageRanges } from "@/lib/utils";

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
        { error: "Inserisci gli intervalli di pagine (es. 1-3, 4-6)" },
        { status: 400 }
      );
    }

    const pageRanges = parsePageRanges(pagesStr);
    if (pageRanges.length === 0) {
      return NextResponse.json(
        { error: "Formato pagine non valido" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const results = await splitPdf(buffer, pageRanges);

    if (results.length === 1) {
      return new NextResponse(new Uint8Array(results[0]), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="split-1.pdf"',
        },
      });
    }

    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      },
    });

    const archive = archiver("zip", { zlib: { level: 0 } });
    archive.pipe(writable);
    results.forEach((buf, i) => {
      archive.append(buf, { name: `split-${i + 1}.pdf` });
    });
    archive.finalize();
    await finished(writable);

    const zipBuffer = Buffer.concat(chunks);
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="split.pdf.zip"',
      },
    });
  } catch (error) {
    console.error("Split error:", error);
    return NextResponse.json(
      { error: "Errore durante la divisione del PDF" },
      { status: 500 }
    );
  }
}
