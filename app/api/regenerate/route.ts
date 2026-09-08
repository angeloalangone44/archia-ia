import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { docOriginal, feedback } = await req.json() as {
    docOriginal: string;
    feedback: string;
  };

  if (!docOriginal?.trim() || !feedback?.trim()) {
    return new Response("docOriginal e feedback são obrigatórios", { status: 400 });
  }

  const client = new Anthropic();

  const prompt = `Você é um assistente especializado em documentos para escritórios de arquitetura brasileiros.

Abaixo está um documento já gerado. Aplique SOMENTE as alterações indicadas no feedback.

REGRAS CRÍTICAS:
- Preserve TODA a estrutura, seções e formato do documento original.
- Aplique APENAS o que foi pedido — não invente dados, não reescreva o que não foi pedido.
- Se o feedback pedir algo que não foi fornecido nos dados originais, inclua uma nota no formato [INFORMAÇÃO NECESSÁRIA: descreva o que falta] no local correspondente, em vez de preencher com suposição.
- Mantenha o mesmo tom, vocabulário e terminologia do original.

DOCUMENTO ORIGINAL:
${docOriginal}

FEEDBACK / ALTERAÇÕES SOLICITADAS:
${feedback}

Produza o documento revisado agora, aplicando apenas as alterações pedidas:`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
