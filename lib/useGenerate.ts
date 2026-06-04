"use client";

import { useState } from "react";
import type { DocumentoTipo } from "./prompts";
import { saveProject } from "./projects";

export function useGenerate() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  async function generate(
    tipo: DocumentoTipo,
    dados: Record<string, string>,
    nome?: string,
    onComplete?: (fullText: string) => void
  ) {
    setIsLoading(true);
    setVisible(true);
    setText("");

    let fullText = "";

    // Strip BOM de todos os valores antes de enviar
    const cleanDados = Object.fromEntries(
      Object.entries(dados).map(([k, v]) => [k, v.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "")])
    );

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, dados: cleanDados }),
      });

      if (!res.ok || !res.body) {
        const err = await res.text();
        setText(`Erro: ${err}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true }).replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "");
        fullText += chunk;
        setText((prev) => prev + chunk);
      }

      if (nome && fullText && !fullText.startsWith("[ERRO")) {
        saveProject({
          tipo,
          nome,
          trecho: fullText.slice(0, 200).replace(/\n+/g, " ").trim(),
          conteudo: fullText,
        });
        onComplete?.(fullText);
      }
    } catch (err) {
      setText(`Erro de conexão: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return { text, isLoading, visible, generate };
}
