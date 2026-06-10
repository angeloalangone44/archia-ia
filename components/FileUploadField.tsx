"use client";

import { useRef, useState } from "react";

type Props = {
  onExtracted: (text: string) => void;
};

export default function FileUploadField({ onExtracted }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setStatus("loading");
    setErrorMsg("");

    if (file.size > 2 * 1024 * 1024) {
      setStatus("error");
      setErrorMsg("Arquivo maior que 2MB. Reduza o tamanho ou cole o texto diretamente.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext ?? "")) {
      setStatus("error");
      setErrorMsg("Formato não suportado. Use .pdf, .docx ou .txt.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Erro ao extrair texto");
      }

      onExtracted(json.text);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Falha ao processar o arquivo.");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ marginTop: 8 }}>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          cursor: status === "loading" ? "wait" : "pointer",
          padding: "6px 12px",
          borderRadius: 8,
          border: "0.5px dashed var(--border-strong)",
          background: "var(--surface2)",
          fontSize: 12,
          color: "var(--ink2)",
          fontFamily: "'DM Sans', sans-serif",
          userSelect: "none",
        }}
      >
        {status === "loading" ? (
          <>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Extraindo texto...
          </>
        ) : (
          <>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 10l-4-4-4 4M12 6v8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ou faça upload de arquivo
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFile}
          disabled={status === "loading"}
          style={{ display: "none" }}
        />
      </label>

      <span style={{ marginLeft: 8, fontSize: 11, color: "var(--ink3)" }}>
        .pdf, .docx, .txt — máx. 2MB
      </span>

      {status === "success" && (
        <p style={{ marginTop: 6, fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width={13} height={13} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Texto extraído com sucesso — revise abaixo antes de salvar
        </p>
      )}

      {status === "error" && (
        <p style={{ marginTop: 6, fontSize: 12, color: "#DC2626" }}>
          {errorMsg}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
