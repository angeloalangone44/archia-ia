import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ImageInput = { base64: string; mediaType: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { images: ImageInput[] };
    if (!body.images?.length) {
      return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    const imageBlocks = body.images.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: img.mediaType as "image/jpeg" | "image/png" | "image/webp",
        data: img.base64,
      },
    }));

    const n = body.images.length;
    const prompt = `Você é um especialista em design de interiores e arquitetura. Analise ${n === 1 ? "esta imagem de referência" : `estas ${n} imagens de referência`} enviadas pelo cliente e identifique:

1. **Paleta de cores** — descreva as cores e tons predominantes
2. **Materiais e acabamentos** — madeira, pedra, metal, tecido, cerâmica, concreto, etc.
3. **Estilo de design** — contemporâneo, clássico, rústico, minimalista, industrial, boho, etc.
4. **Iluminação** — tipo (natural/artificial, direta/indireta) e atmosfera
5. **Atmosfera geral** — sensação e ambientação transmitida

Seja objetivo e use terminologia de arquitetura e design de interiores. Responda em português brasileiro, de forma concisa (máximo 200 palavras).`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [...imageBlocks, { type: "text" as const, text: prompt }],
        },
      ],
    });

    const analysis = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[analyze-images]", err);
    return NextResponse.json({ error: "Erro ao analisar imagens." }, { status: 500 });
  }
}
