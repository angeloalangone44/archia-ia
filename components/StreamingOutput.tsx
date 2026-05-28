"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  isStreaming: boolean;
  visible: boolean;
};

export default function StreamingOutput({ text, isStreaming, visible }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [text]);

  if (!visible) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="mt-6 overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{
          background: "var(--surface2)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ink2)" }}>
          {isStreaming && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                animation: "pulse 1.5s infinite",
              }}
            />
          )}
          {isStreaming ? "Gerando documento..." : "Documento gerado"}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 rounded-md transition-colors"
          style={{
            color: "var(--ink2)",
            background: "var(--surface)",
            border: "0.5px solid var(--border-strong)",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="px-6 py-5 text-[13px] leading-7 whitespace-pre-wrap overflow-y-auto"
        style={{
          color: "var(--ink)",
          minHeight: 100,
          maxHeight: 480,
        }}
      >
        {text}
        {isStreaming && (
          <span
            className="inline-block ml-0.5 align-middle"
            style={{ animation: "blink 0.8s step-end infinite" }}
          >
            ▋
          </span>
        )}
      </div>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
