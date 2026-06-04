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
import {
  getArchiaProjects,
  deleteArchiaProject,
  updateAmbienteValorEstimado,
  type ArchiaProjetoUnificado,
  AMBIENTE_LABELS,
} from "@/lib/archia-project";
import { getStageProgress } from "@/lib/stages";
import { getNextCompromisso, TIPO_LABEL as C_TIPO_LABEL, TIPO_COLOR, relativeDay } from "@/lib/planner";
import StageTracker from "@/components/StageTracker";

const BOM_RE = new RegExp(String.fromCharCode(0xFEFF), "g");
function sanitize(text: string) { return text.replace(BOM_RE, ""); }
function renderHtml(text: string): string { return String(marked.parse(sanitize(text))); }
function initials(nome: string): string {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* ── CSS de impressão ─────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  @page { margin: 2cm; size: A4 portrait; }
  body * { visibility: hidden !important; }
  #projeto-print, #projeto-print * { visibility: visible !important; }
  #projeto-print {
    position: static !important;
    width: 100% !important;
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    font-family: Georgia, 'Times New Roman', serif;
  }
  #projeto-print * { page-break-inside: auto; }
  #projeto-print h2, #projeto-print h3 { page-break-after: avoid; }
  #projeto-print p, #projeto-print li { orphans: 3; widows: 3; }
  .no-print { display: none !important; }
}
`;

const DOC_CSS = `
  #projeto-print .doc-logo {
    font-family: Georgia, serif; font-size: 18px; letter-spacing: -0.5px;
    color: #7A5C14; border-bottom: 1px solid #D8D0C0;
    padding-bottom: 16px; margin-bottom: 28px;
  }
  #projeto-print .doc-logo span { display: block; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #9B8060; margin-top: 4px; }
  #projeto-print h1, #projeto-print h2 {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: #1A1410; margin: 24px 0 8px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.09);
  }
  #projeto-print h3 { font-size: 13px; font-weight: 600; color: #2D5A3D; margin: 14px 0 6px; }
  #projeto-print p { font-size: 13px; line-height: 1.85; color: #2C2C2C; margin: 6px 0; font-family: Georgia, serif; }
  #projeto-print ul, #projeto-print ol { padding-left: 20px; margin: 6px 0; }
  #projeto-print li { font-size: 13px; line-height: 1.7; color: #2C2C2C; margin: 3px 0; font-family: Georgia, serif; }
  #projeto-print strong { font-weight: 700; color: #1A1A1A; }
  #projeto-print hr { border: none; border-top: 1px solid #E5E0D8; margin: 20px 0; }
  #projeto-print blockquote { border-left: 3px solid #D8D0C0; padding-left: 14px; color: #7A6A50; font-style: italic; margin: 10px 0; }
`;

/* ── Abas do detalhe unificado ────────────────────────────── */

type DetalheTab = "cliente" | "ambientes" | "documentos";

function ProjetoUnificadoDetalhe({
  projeto,
  onVoltar,
}: {
  projeto: ArchiaProjetoUnificado;
  onVoltar: () => void;
}) {
  const [tab, setTab] = useState<DetalheTab>("documentos");
  const [printDoc, setPrintDoc] = useState<"briefing" | "proposta" | "especificacoes" | null>(null);

  const tabs: { id: DetalheTab; label: string }[] = [
    { id: "documentos", label: "Documentos" },
    { id: "cliente", label: "Cliente e projeto" },
    { id: "ambientes", label: "Por ambiente" },
  ];

  return (
    <>
      <style>{PRINT_CSS}{DOC_CSS}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-5">
        <button onClick={onVoltar}
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--ink2)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Voltar para projetos
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium"
            style={{ background: "#E8EFF6", color: "#1A3A5C" }}>
            {initials(projeto.cliente.nome) || "—"}
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{projeto.cliente.nome}</p>
            <p className="text-[11px]" style={{ color: "var(--ink3)" }}>{projeto.projeto.tipo}</p>
          </div>
        </div>
      </div>

      {/* Stage tracker */}
      <div className="no-print rounded-2xl px-6 py-5 mb-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
        <StageTracker projetoId={projeto.id} />
      </div>

      {/* Abas */}
      <div className="no-print flex gap-1 mb-5 rounded-xl p-1" style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 text-[12px] py-2 rounded-lg transition-all"
            style={{
              background: tab === t.id ? "var(--surface)" : "transparent",
              color: tab === t.id ? "var(--ink)" : "var(--ink3)",
              fontWeight: tab === t.id ? 500 : 400,
              border: tab === t.id ? "0.5px solid var(--border)" : "none",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Aba: Documentos ─── */}
      {tab === "documentos" && (
        <div className="flex flex-col gap-3">
          {(["briefing", "proposta", "especificacoes"] as const).map((tipo) => {
            const doc = projeto.documentos[tipo];
            const labels = { briefing: "Briefing técnico", proposta: "Proposta comercial", especificacoes: "Caderno de especificações" };
            const hrefs = { briefing: "/app/briefing", proposta: "/app/proposta", especificacoes: "/app/specs" };
            const styles = {
              briefing: { bg: "#E8EFF6", color: "#1A3A5C" },
              proposta: { bg: "#EAF2EC", color: "#2D5A3D" },
              especificacoes: { bg: "#FDF3DC", color: "#8B6914" },
            };
            const s = styles[tipo];
            return (
              <div key={tipo} className="rounded-2xl px-5 py-4"
                style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}>
                      {labels[tipo]}
                    </span>
                    {doc && (
                      <span className="text-[11px]" style={{ color: "var(--ink3)" }}>
                        {new Date(doc.data).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  {doc ? (
                    <button
                      onClick={() => {
                        setPrintDoc(tipo);
                        setTimeout(() => window.print(), 100);
                      }}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
                      style={{ background: s.bg, color: s.color, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                      </svg>
                      Exportar PDF
                    </button>
                  ) : (
                    <Link href={hrefs[tipo]}
                      className="text-[11px] px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px solid var(--border)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
                      Gerar
                    </Link>
                  )}
                </div>
                {doc ? (
                  <div className="text-[12px] leading-relaxed" style={{ color: "var(--ink3)" }}>
                    {stripMarkdown(doc.conteudo).slice(0, 120)}…
                  </div>
                ) : (
                  <p className="text-[12px]" style={{ color: "var(--ink3)" }}>Ainda não gerado</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Aba: Cliente e projeto ─── */}
      {tab === "cliente" && (
        <div className="rounded-2xl px-6 py-5" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <div className="grid grid-cols-2 gap-y-4">
            {[
              ["Nome", projeto.cliente.nome],
              ["Localização", projeto.cliente.localizacao],
              ["Moradores", projeto.cliente.moradores],
              ["Pet", projeto.cliente.pet],
              ["Tipo", projeto.projeto.tipo],
              ["Área", projeto.projeto.area],
              ["Orçamento", projeto.projeto.orcamento],
              ["Prazo", projeto.projeto.prazo],
            ].map(([label, value]) => value && (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink3)" }}>{label}</p>
                <p className="text-[13px]" style={{ color: "var(--ink)" }}>{value}</p>
              </div>
            ))}
          </div>
          {(projeto.cliente.perfilEstetico.tomNeutro || projeto.cliente.perfilEstetico.corQueGosta || projeto.cliente.perfilEstetico.corQueNaoQuer) && (
            <div className="mt-5 pt-4" style={{ borderTop: "0.5px solid var(--border)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "var(--ink3)" }}>Perfil estético</p>
              <div className="grid grid-cols-3 gap-4">
                {projeto.cliente.perfilEstetico.tomNeutro && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink3)" }}>Tom neutro</p>
                    <p className="text-[13px]" style={{ color: "var(--ink)" }}>{projeto.cliente.perfilEstetico.tomNeutro}</p>
                  </div>
                )}
                {projeto.cliente.perfilEstetico.corQueGosta && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink3)" }}>Cor favorita</p>
                    <p className="text-[13px]" style={{ color: "var(--ink)" }}>{projeto.cliente.perfilEstetico.corQueGosta}</p>
                  </div>
                )}
                {projeto.cliente.perfilEstetico.corQueNaoQuer && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--ink3)" }}>Evitar</p>
                    <p className="text-[13px]" style={{ color: "var(--ink)" }}>{projeto.cliente.perfilEstetico.corQueNaoQuer}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {projeto.cliente.referenciasVisuais?.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: "0.5px solid var(--border)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "var(--ink3)" }}>Referências visuais</p>
              <div className="flex flex-col gap-1.5">
                {projeto.cliente.referenciasVisuais.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] truncate"
                    style={{ color: "var(--accent)", textDecoration: "none" }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Aba: Por ambiente ─── */}
      {tab === "ambientes" && (
        <div className="flex flex-col gap-3">
          {projeto.ambientesOrdem.map((id) => {
            const d = projeto.ambientes[id];
            const label = AMBIENTE_LABELS[id] ?? id;
            if (!d) return null;

            const itens: { key: string; valor: string }[] = [
              d.estilo && { key: "Estilo", valor: d.estilo },
              d.paredeRevestimento && { key: "Parede", valor: d.paredeRevestimento },
              d.pisoRevestimento && { key: "Piso", valor: d.pisoRevestimento },
              d.iluminacao && { key: "Iluminação", valor: d.iluminacao },
              d.madeira && { key: "Madeira", valor: d.madeira },
              d.tipoBacia && { key: "Bacia", valor: `${d.tipoBacia}${d.corBacia ? ` — ${d.corBacia}` : ""}` },
              d.tipoCuba && { key: "Cuba", valor: d.tipoCuba },
              d.tipoTorneira && { key: "Torneira", valor: d.tipoTorneira },
              d.tipoChuveiro && { key: "Chuveiro", valor: d.tipoChuveiro },
              d.materialBancada && { key: "Bancada", valor: d.materialBancada },
              d.tipoMetal && { key: "Metal", valor: d.tipoMetal },
              d.cooktop && { key: "Cooktop", valor: `${d.cooktop}${d.numBocas ? ` — ${d.numBocas}` : ""}` },
              d.coifa && { key: "Coifa", valor: d.coifa },
              d.lavaLouca && { key: "Lava-louça", valor: d.lavaLouca },
              d.cubaCozinha && { key: "Cuba (cozinha)", valor: d.cubaCozinha },
              d.materialBancadaCozinha && { key: "Bancada (coz.)", valor: d.materialBancadaCozinha },
              d.tamanhoCama && { key: "Cama", valor: d.tamanhoCama },
              d.tipoCabeceira && { key: "Cabeceira", valor: d.tipoCabeceira },
              d.churrasqueira && d.churrasqueira !== "Não" && { key: "Churrasqueira", valor: d.churrasqueira },
              d.itens.length > 0 && { key: "Itens", valor: d.itens.join(", ") },
              d.aproveitarMoveisDetalhe && { key: "Móveis existentes", valor: d.aproveitarMoveisDetalhe },
              d.moveisNovosDetalhe && { key: "Móveis novos", valor: d.moveisNovosDetalhe },
            ].filter(Boolean) as { key: string; valor: string }[];

            if (itens.length === 0) return null;

            return (
              <div key={id} className="rounded-2xl overflow-hidden"
                style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
                <div className="px-5 py-3" style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
                  <p className="text-[12px] font-medium uppercase tracking-wide" style={{ color: "var(--ink)" }}>{label}</p>
                </div>
                <div className="px-5 py-2">
                  {itens.map(({ key, valor }) => (
                    <AmbienteRow
                      key={key}
                      label={key}
                      valor={valor}
                      valorEstimado={d.valoresEstimados?.[key] ?? ""}
                      onChangeValor={(v) => updateAmbienteValorEstimado(projeto.id, id, key, v)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {projeto.ambientesOrdem.length === 0 && (
            <p className="text-[13px] text-center py-8" style={{ color: "var(--ink3)" }}>
              Nenhum ambiente registrado — gere um briefing para ver os dados aqui.
            </p>
          )}
        </div>
      )}

      {/* Área de impressão (invisível na tela) */}
      {printDoc && projeto.documentos[printDoc] && (
        <div id="projeto-print" style={{ display: "none" }}>
          <div className="doc-logo">
            archi·ia · {
              printDoc === "briefing" ? "Briefing técnico" :
              printDoc === "proposta" ? "Proposta comercial" :
              "Caderno de especificações"
            }
            <span>{projeto.cliente.nome}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: renderHtml(projeto.documentos[printDoc]!.conteudo) }} />
        </div>
      )}
    </>
  );
}

/* ── linha de item de ambiente com valor estimado ──────────── */

function AmbienteRow({
  label, valor, valorEstimado, onChangeValor,
}: {
  label: string; valor: string;
  valorEstimado: string; onChangeValor: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localValor, setLocalValor] = useState(valorEstimado);

  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <span className="text-[11px] w-28 flex-shrink-0" style={{ color: "var(--ink3)" }}>{label}</span>
      <span className="text-[12px] flex-1" style={{ color: "var(--ink)" }}>{valor}</span>
      {editing ? (
        <input
          autoFocus
          value={localValor}
          onChange={(e) => setLocalValor(e.target.value)}
          onBlur={() => { onChangeValor(localValor); setEditing(false); }}
          onKeyDown={(e) => e.key === "Enter" && (onChangeValor(localValor), setEditing(false))}
          placeholder="R$ 0,00"
          className="text-[11px] px-2 py-1 rounded"
          style={{ width: 90, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}
        />
      ) : (
        <button onClick={() => setEditing(true)}
          className="text-[10px] px-2 py-1 rounded flex-shrink-0"
          style={{
            background: valorEstimado ? "var(--accent-light)" : "var(--surface2)",
            color: valorEstimado ? "var(--accent)" : "var(--ink3)",
            border: "0.5px solid var(--border)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
          {valorEstimado || "+ valor est."}
        </button>
      )}
    </div>
  );
}

/* ── detalhe de documento antigo (legado) ─────────────────── */

function ProjetoDetalhe({ projeto, onVoltar }: { projeto: Projeto; onVoltar: () => void }) {
  const style = TIPO_STYLE[projeto.tipo];
  const html = renderHtml(projeto.conteudo || projeto.trecho || "");

  return (
    <>
      <style>{PRINT_CSS}{DOC_CSS}</style>
      <div>
        <div className="no-print flex items-center justify-between mb-5">
          <button onClick={onVoltar}
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--ink2)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Voltar para projetos
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-medium text-white rounded-lg px-4 py-2"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
            </svg>
            Exportar PDF
          </button>
        </div>

        <div className="no-print flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: style.bg, color: style.color }}>
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

        <div className="no-print rounded-2xl px-6 py-5 mb-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <StageTracker projetoId={projeto.id} />
        </div>

        <div id="projeto-print" className="rounded-2xl"
          style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "32px 40px" }}>
          <div className="doc-logo">
            archi.ia · {TIPO_LABEL[projeto.tipo]}
            <span>{projeto.nome}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </>
  );
}

/* ── próximos compromissos ────────────────────────────────── */

function ProximosCompromissos({ projetoId }: { projetoId: string }) {
  const [items, setItems] = useState<ReturnType<typeof getNextCompromisso>[]>([]);

  useEffect(() => {
    import("@/lib/planner").then(({ getCompromissosByProjeto }) => {
      const list = getCompromissosByProjeto(projetoId).slice(0, 3);
      setItems(list);
    });
  }, [projetoId]);

  if (!items.length) return null;

  return (
    <div className="no-print rounded-2xl px-6 py-5 mb-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
      <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--ink3)" }}>Próximos compromissos</p>
      {items.map((c) => {
        if (!c) return null;
        return (
          <div key={c.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: TIPO_COLOR[c.tipo] }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] truncate" style={{ color: "var(--ink)" }}>{c.titulo}</p>
              <p className="text-[11px]" style={{ color: "var(--ink3)" }}>{C_TIPO_LABEL[c.tipo]}</p>
            </div>
            <span className="text-[11px] flex-shrink-0" style={{ color: "var(--ink3)" }}>
              {relativeDay(c.data)}{c.horario ? ` · ${c.horario}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── lista principal ──────────────────────────────────────── */

export default function ProjectPanel() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosV2, setProjetosV2] = useState<ArchiaProjetoUnificado[]>([]);
  const [selected, setSelected] = useState<Projeto | null>(null);
  const [selectedV2, setSelectedV2] = useState<ArchiaProjetoUnificado | null>(null);

  useEffect(() => {
    setProjetos(getProjects());
    setProjetosV2(getArchiaProjects());
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteProject(id);
    setProjetos(getProjects());
    if (selected?.id === id) setSelected(null);
  }

  function handleDeleteV2(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteArchiaProject(id);
    setProjetosV2(getArchiaProjects());
    if (selectedV2?.id === id) setSelectedV2(null);
  }

  if (selectedV2) {
    return <ProjetoUnificadoDetalhe projeto={selectedV2} onVoltar={() => setSelectedV2(null)} />;
  }

  if (selected) {
    return <ProjetoDetalhe projeto={selected} onVoltar={() => setSelected(null)} />;
  }

  const total = projetosV2.length + projetos.length;

  if (total === 0) {
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
      {/* Projetos v2 (unificados) */}
      {projetosV2.map((p) => {
        const docCount = Object.values(p.documentos).filter(Boolean).length;
        const { concluidas, total: stageTotal, atual } = getStageProgress(p.id);
        const pct = stageTotal > 0 ? (concluidas / stageTotal) * 100 : 0;
        const nextC = getNextCompromisso(p.id);
        return (
          <div key={p.id} onClick={() => setSelectedV2(p)}
            className="flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all hover:-translate-y-px"
            style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: "#E8EFF6", color: "#1A3A5C" }}>
              {initials(p.cliente.nome) || "—"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{p.cliente.nome}</div>
              {atual ? (
                <div className="mt-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full overflow-hidden flex-1" style={{ height: 3, background: "var(--border)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#2D5A3D", transition: "width 0.3s" }} />
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--ink3)" }}>{atual}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[12px] mt-0.5" style={{ color: "var(--ink3)" }}>
                  {p.projeto.tipo}{p.cliente.localizacao ? ` · ${p.cliente.localizacao}` : ""}
                </div>
              )}
              {nextC && (
                <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: TIPO_COLOR[nextC.tipo] }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: TIPO_COLOR[nextC.tipo], flexShrink: 0 }} />
                  {C_TIPO_LABEL[nextC.tipo]} · {relativeDay(nextC.data)}
                </div>
              )}
            </div>

            {/* Doc count badge */}
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "#E8EFF6", color: "#1A3A5C" }}>
              {docCount}/3 docs
            </span>

            {/* Data */}
            <span className="text-[11px] flex-shrink-0" style={{ color: "var(--ink3)" }}>{relativeDate(p.updatedAt)}</span>

            {/* Delete */}
            <button onClick={(e) => handleDeleteV2(p.id, e)} title="Remover projeto"
              className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
              style={{ color: "var(--ink)", background: "none", border: "none", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}

      {/* Projetos legados */}
      {projetos.length > 0 && (
        <>
          {projetosV2.length > 0 && (
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1" style={{ height: "0.5px", background: "var(--border)" }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--ink3)" }}>documentos anteriores</span>
              <div className="flex-1" style={{ height: "0.5px", background: "var(--border)" }} />
            </div>
          )}
          {projetos.map((p) => {
            const style = TIPO_STYLE[p.tipo];
            const ini = initials(p.nome);
            const preview = stripMarkdown(p.trecho || "").slice(0, 80);
            const { concluidas, total: stageTotal, atual } = getStageProgress(p.id);
            const pct = stageTotal > 0 ? (concluidas / stageTotal) * 100 : 0;
            const nextC = getNextCompromisso(p.id);
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                className="flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all hover:-translate-y-px"
                style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: style.bg, color: style.color }}>
                  {ini || "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{p.nome}</div>
                  {concluidas > 0 || atual ? (
                    <div className="mt-1 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full overflow-hidden flex-1" style={{ height: 3, background: "var(--border)" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#2D5A3D", transition: "width 0.3s" }} />
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--ink3)" }}>
                          {atual ? atual : `${concluidas}/${stageTotal}`}
                        </span>
                      </div>
                    </div>
                  ) : preview ? (
                    <div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink3)" }}>{preview}</div>
                  ) : null}
                  {nextC && (
                    <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: TIPO_COLOR[nextC.tipo] }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: TIPO_COLOR[nextC.tipo], flexShrink: 0 }} />
                      {C_TIPO_LABEL[nextC.tipo]} · {relativeDay(nextC.data)}{nextC.horario ? ` às ${nextC.horario}` : ""}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: style.bg, color: style.color }}>
                  {TIPO_LABEL[p.tipo]}
                </span>
                <span className="text-[11px] flex-shrink-0" style={{ color: "var(--ink3)" }}>{relativeDate(p.data)}</span>
                <button onClick={(e) => handleDelete(p.id, e)} title="Remover"
                  className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--ink)", background: "none", border: "none", cursor: "pointer" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </>
      )}

      <p className="text-[11px] text-center pt-2" style={{ color: "var(--ink3)" }}>
        {total} {total === 1 ? "projeto" : "projetos"} · salvo localmente neste navegador
      </p>
    </div>
  );
}
