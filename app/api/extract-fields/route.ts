import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const EXTRACTION_PROMPT = `Extraia as seguintes informações do conteúdo abaixo, se presentes.
Retorne SOMENTE um objeto JSON válido, sem markdown, sem explicação.
Para campos não encontrados, retorne null.

Campos a extrair:
- nome: nome completo do cliente (string ou null)
- tipo_projeto: um de "Residencial", "Comercial", "Reforma", "Interiores" (string ou null)
- metragem: número com unidade, ex: "120 m²" (string ou null)
- orcamento: valor ou faixa mencionada, ex: "R$ 250.000" ou "300 a 400 mil" (string ou null)
- prazo: prazo desejado, ex: "8 meses" (string ou null)
- localizacao: cidade ou bairro (string ou null)
- como_conheceu: como conheceu o arquiteto, ex: "indicação", "Instagram" (string ou null)
- descricao: resumo objetivo do que o cliente quer, reescrito em até 3 linhas claras (string ou null)

Retorne exatamente este formato JSON:
{"nome":null,"tipo_projeto":null,"metragem":null,"orcamento":null,"prazo":null,"localizacao":null,"como_conheceu":null,"descricao":null}`;

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    if (!text && !file) {
      return NextResponse.json({ error: "Nenhum conteúdo enviado." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = [];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
      }
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
      if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: "Formato não suportado. Use JPG, PNG ou PDF." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      if (file.type === "application/pdf") {
        // Use Claude's native PDF support
        content.push({ type: "text", text: EXTRACTION_PROMPT });
        content.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        });
      } else {
        content.push({ type: "text", text: `${EXTRACTION_PROMPT}\n\nImagem enviada:` });
        content.push({
          type: "image",
          source: { type: "base64", media_type: file.type as ImageMediaType, data: base64 },
        });
      }
    } else {
      content.push({
        type: "text",
        text: `${EXTRACTION_PROMPT}\n\nTexto a analisar:\n"""\n${text}\n"""`,
      });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Não foi possível extrair informações." }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ fields: parsed });
  } catch (err) {
    console.error("extract-fields error:", err);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
