"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProjects,
  deleteProject,
  relativeDate,
  TIPO_LABEL,
  TIPO_STYLE,
  type Projeto,
} from "@/lib/projects";

function initials(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function ProjectPanel() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    setProjetos(getProjects());
  }, []);

  function handleDelete(id: string) {
    deleteProject(id);
    setProjetos(getProjects());
  }

  if (projetos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
          style={{ background: "var(--surface2)" }}
        >
          🗂️
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Nenhum projeto ainda
        </p>
        <p className="text-xs mt-1.5 max-w-xs" style={{ color: "var(--ink3)" }}>
          Os documentos gerados aparecem aqui automaticamente depois da primeira geração.
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            href="/app/briefing"
            className="text-xs px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Gerar briefing
          </Link>
          <Link
            href="/app/proposta"
            className="text-xs px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              border: "0.5px solid var(--border-strong)",
              color: "var(--ink2)",
              background: "var(--surface)",
            }}
          >
            Gerar proposta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projetos.map((p) => {
        const style = TIPO_STYLE[p.tipo];
        const ini = initials(p.nome);
        return (
          <div
            key={p.id}
            className="flex items-start gap-4 rounded-2xl px-5 py-4"
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: style.bg, color: style.color }}
            >
              {ini || "—"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                {p.nome}
              </div>
              {p.trecho && (
                <div
                  className="text-xs mt-0.5 line-clamp-1"
                  style={{ color: "var(--ink3)" }}
                  title={p.trecho}
                >
                  {p.trecho}
                </div>
              )}
            </div>

            {/* Badge tipo */}
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: style.bg, color: style.color }}
            >
              {TIPO_LABEL[p.tipo]}
            </span>

            {/* Data */}
            <span
              className="text-[11px] flex-shrink-0"
              style={{ color: "var(--ink3)" }}
            >
              {relativeDate(p.data)}
            </span>

            {/* Deletar */}
            <button
              onClick={() => handleDelete(p.id)}
              title="Remover projeto"
              className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
              style={{ color: "var(--ink)", background: "none", border: "none", cursor: "pointer" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}

      {/* Rodapé */}
      <p className="text-[11px] text-center pt-2" style={{ color: "var(--ink3)" }}>
        {projetos.length} {projetos.length === 1 ? "projeto" : "projetos"} · salvo localmente neste navegador
      </p>
    </div>
  );
}
