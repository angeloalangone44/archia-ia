import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo maior que 2MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  let text = "";

  try {
    if (ext === "txt") {
      text = await file.text();
    } else if (ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import("pdf-parse")) as any;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fn = pdfParse.default ?? pdfParse;
      const result = await fn(buffer);
      text = result.text;
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Formato não suportado" }, { status: 400 });
    }
  } catch (err) {
    console.error("Extração falhou:", err);
    return NextResponse.json({ error: "Falha ao extrair texto do arquivo" }, { status: 500 });
  }

  text = text.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  return NextResponse.json({ text, preview: text.slice(0, 300) });
}
