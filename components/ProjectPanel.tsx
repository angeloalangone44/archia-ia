"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import {
  getProjects,
  deleteProject,
  relativeDate,
  stripMarkdown,
  TIPO_LABEL,
  TIPO_STYLE,
  type Projeto,
} from "@/lib/projects";

const BOM_RE = new RegExp(String.fromCharCode(0xFEFF), "g");

function sanitize(text: string) {
  return text.replace(BOM_RE, "");
}

function renderHtml(text: string): string {
  return String(marked.parse(sanitize(text)));
}

function initials(nome: string): string {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* ── CSS de impressão para detalhe de projeto ─────────────── */
const PRINT_CSS = `
@media print {
  @page { margin: 1.5cm 2cm; size: A4 portrait; }
  body * { visibility: hidden !important; }
  #projeto-print, #projeto-print * { visibility: visible !important; }
  #projeto-print {
    position: fixed !important; top: 0 !important; left: 0 !important;
    width: 100% !important; padding: 0 2cm !important;
    border-radius: 0 !important; box-shadow: none !important; overflow: visible !important;
  }
  #projeto-print * { page-break-inside: auto; }
  #projeto-print h1, #projeto-print h2, #projeto-print h3 { page-break-after: avoid; }
  #projeto-print p, #projeto-print li { orphans: 3; widows: 3; }
  .no-print { display: none !important; }
}
`;

/* ── Visualização de detalhe ─────────────────────────────── */

function ProjetoDetalhe({ projeto, onVoltar }: { projeto: Projeto; onVoltar: () => void }) {
  const style = TIPO_STYLE[projeto.tipo];
  const html = renderHtml(projeto.conteudo || projeto.trecho || "");

  return (
    <>
      <style>{PRINT_CSS}</style>
      <style>{`
        #projeto-print h1, #projeto-print h2 {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #1A1410;
          margin: 24px 0 8px; padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.09);
        }
        #projeto-print h3 { font-size: 13px; font-weight: 600; color: #2D5A3D; margin: 14px 0 6px; }
        #projeto-print p { font-size: 13px; line-height: 1.8; color: #2C2C2C; margin: 6px 0; }
        #projeto-print ul, #projeto-print ol { padding-left: 20px; margin: 6px 0; }
        #projeto-print li { font-size: 13px; line-height: 1.7; color: #2C2C2C; margin: 3px 0; }
        #projeto-print strong { font-weight: 600; color: #1A1A1A; }
        #projeto-print hr { border: none; border-top: 1px solid #E5E0D8; margin: 20px 0; }
        #projeto-print blockquote { border-left: 3px solid #D8D0C0; padding-left: 14px; color: #7A6A50; font-style: italic; margin: 10px 0; }
      `}</style>

      <div>
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between mb-5">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--ink2)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Voltar para projetos
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-medium text-white rounded-lg px-4 py-2"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
            </svg>
            Exportar PDF
          </button>
        </div>

        {/* Meta info */}
        <div className="no-print flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: style.bg, color: style.color }}
          >
            {initials(projeto.nome) || "—"}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{projeto.nome}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>
                {TIPO_LABEL[projeto.tipo]}
              </span>
              <span className="text-[11px]" style={{ color: "var(--ink3)" }}>{relativeDate(projeto.data)}</span>
            </div>
          </div>
        </div>

        {/* Document */}
        <div
          id="projeto-print"
          className="rounded-2xl"
          style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "32px 40px" }}
        >
          {/* print header */}
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #E5E0D8" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A5C14", fontFamily: "Georgia, serif" }}>
              archi.ia · {TIPO_LABEL[projeto.tipo]}
            </span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </>
  );
}

/* ── Lista de projetos ────────────────────────────────────── */

export default function ProjectPanel() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selected, setSelected] = useState<Projeto | null>(null);

  useEffect(() => {
    setProjetos(getProjects());
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteProject(id);
    setProjetos(getProjects());
    if (selected?.id === id) setSelected(null);
  }

  if (selected) {
    return <ProjetoDetalhe projeto={selected} onVoltar={() => setSelected(null)} />;
  }

  if (projetos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: "var(--surface2)" }}>
          🗂️
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>Nenhum projeto ainda</p>
        <p className="text-xs mt-1.5 max-w-xs" style={{ color: "var(--ink3)" }}>
          Os documentos gerados aparecem aqui automaticamente depois da primeira geração.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/app/briefing" className="text-xs px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90" style={{ background: "var(--accent)" }}>
            Gerar briefing
          </Link>
          <Link href="/app/proposta" className="text-xs px-4 py-2 rounded-lg font-medium transition-colors" style={{ border: "0.5px solid var(--border-strong)", color: "var(--ink2)", background: "var(--surface)" }}>
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
        const preview = stripMarkdown(p.trecho || "").slice(0, 80);
        return (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all hover:-translate-y-px"
            style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: style.bg, color: style.color }}>
              {ini || "—"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{p.nome}</div>
              {preview && (
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink3)" }} title={preview}>
                  {preview}
                </div>
              )}
            </div>

            {/* Badge */}
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: style.bg, color: style.color }}>
              {TIPO_LABEL[p.tipo]}
            </span>

            {/* Data */}
            <span className="text-[11px] flex-shrink-0" style={{ color: "var(--ink3)" }}>{relativeDate(p.data)}</span>

            {/* Delete */}
            <button
              onClick={(e) => handleDelete(p.id, e)}
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

      <p className="text-[11px] text-center pt-2" style={{ color: "var(--ink3)" }}>
        {projetos.length} {projetos.length === 1 ? "projeto" : "projetos"} · salvo localmente neste navegador
      </p>
    </div>
  );
}
