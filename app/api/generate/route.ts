import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  PROMPTS,
  type BriefingDados,
  type SpecsDados,
  type PropostaDados,
  type DocumentoTipo,
} from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type RequestBody = {
  tipo: DocumentoTipo;
  dados: BriefingDados | SpecsDados | PropostaDados;
  extraContext?: string;
};

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { tipo, dados, extraContext } = body;

  if (!tipo || !dados) {
    return new Response(JSON.stringify({ error: "tipo e dados são obrigatórios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!["briefing", "specs", "proposta"].includes(tipo)) {
    return new Response(JSON.stringify({ error: "tipo inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const promptFn = PROMPTS[tipo] as (d: never) => string;
  const userPrompt = promptFn(dados as never);
  const systemPrompt = buildSystemPrompt(extraContext);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";
        controller.enqueue(encoder.encode(`\n\n[ERRO: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
