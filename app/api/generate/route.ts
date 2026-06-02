import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  PROMPTS,
  type DocumentoTipo,
} from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type RequestBody = {
  tipo: DocumentoTipo;
  dados: Record<string, unknown>;
  extraContext?: string;
};

const VALID_TIPOS: DocumentoTipo[] = ["qualificacao", "briefing", "specs", "proposta"];

// briefing por ambiente pode ser longo — tokens extras
const MAX_TOKENS: Record<DocumentoTipo, number> = {
  qualificacao: 1500,
  briefing:     4000,
  specs:        3000,
  proposta:     3000,
};

/** Remove BOM (U+FEFF) de todos os valores string — evita ByteString error no Edge runtime */
function stripBom(dados: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(dados).map(([k, v]) => [
      k,
      typeof v === "string" ? v.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "") : v,
    ])
  );
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { tipo, dados: rawDados, extraContext } = body;
  const dados = stripBom(rawDados);

  if (!tipo || !dados) {
    return new Response(JSON.stringify({ error: "tipo e dados são obrigatórios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!VALID_TIPOS.includes(tipo)) {
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
          model: "claude-sonnet-4-5",
          max_tokens: MAX_TOKENS[tipo],
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

