"use client";

import type { ProjetoUnificado } from "@/lib/continuity";

type Props = {
  projeto: ProjetoUnificado;
  modulo: "proposta" | "specs";
  onConfirm: (p: ProjetoUnificado) => void;
  onDismiss: () => void;
};

const MODULO_MSG = {
  proposta: "sem proposta associada — usar dados do briefing?",
  specs: "sem caderno de especificações — usar dados do briefing?",
};

export default function ContinuityBanner({ projeto, modulo, onConfirm, onDismiss }: Props) {
  return (
    <div
      className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: "var(--accent-light)",
        border: "0.5px solid rgba(45,90,61,0.3)",
      }}
    >
      <div>
        <p className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
          Projeto de <strong>{projeto.clienteNome}</strong>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink2)" }}>
          {MODULO_MSG[modulo]}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onConfirm(projeto)}
          style={{
            fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 8,
            background: "var(--accent)", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Usar dados
        </button>
        <button
          onClick={onDismiss}
          style={{
            fontSize: 12, padding: "6px 12px", borderRadius: 8,
            background: "transparent", color: "var(--ink3)",
            border: "0.5px solid var(--border-strong)", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Ignorar
        </button>
      </div>
    </div>
  );
}
