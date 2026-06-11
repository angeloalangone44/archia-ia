"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { PDF_THEMES, getTema, type TemaDocumento } from "@/lib/pdf-themes";

// ── Types ─────────────────────────────────────────────────────

type Props = {
  text: string;
  isStreaming: boolean;
  visible: boolean;
  nomeEscritorio?: string;
  logoBase64?: string;
  logoPosicao?: "cabecalho" | "marca-dagua";
  temaDocumento?: TemaDocumento;
  onTemaChange?: (id: TemaDocumento) => void;
};

// ── Helpers ───────────────────────────────────────────────────

function sanitize(text: string): string {
  return text.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "");
}

function renderHtml(text: string): string {
  return String(marked.parse(sanitize(text)));
}

// ── CSS de impressão (com forçar cores) ───────────────────────

const PRINT_CSS = `
@media print {
  @page { margin: 1.5cm 2cm; size: A4 portrait; }
  body * { visibility: hidden !important; }
  #archia-doc, #archia-doc * { visibility: visible !important; }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  #archia-doc {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    width: 100% !important;
    min-height: 100vh !important;
    padding: 0 2cm !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    z-index: 99999 !important;
  }
  #archia-doc * { page-break-inside: auto; }
  #archia-doc h1, #archia-doc h2, #archia-doc h3 { page-break-after: avoid; }
  #archia-doc p, #archia-doc li { orphans: 3; widows: 3; }
  .doc-controls { display: none !important; }
}
`;

// ── Conteúdo de exemplo para preview ─────────────────────────

const PREVIEW_MD = `## APRESENTAÇÃO DO ESCRITÓRIO

Especialistas em projetos residenciais de alto padrão. Nossa metodologia une **visão técnica** e sensibilidade criativa para entregar espaços únicos.

## ESCOPO DE SERVIÇOS

- Estudo preliminar e conceito
- Anteprojeto completo
- Projeto executivo com detalhamentos
- Acompanhamento de obra

## HONORÁRIOS

**Valor total:** R$ 45.000
Pagamento em 3 parcelas: entrada, aprovação e entrega final.

> Validade desta proposta: 30 dias.`;

// ── Overlay do documento ──────────────────────────────────────

function DocumentOverlay({
  text,
  temaId,
  nomeEscritorio,
  logoBase64,
  logoPosicao,
  onClose,
  onTemaChange,
}: {
  text: string;
  temaId: TemaDocumento;
  nomeEscritorio?: string;
  logoBase64?: string;
  logoPosicao?: "cabecalho" | "marca-dagua";
  onClose: () => void;
  onTemaChange?: (id: TemaDocumento) => void;
}) {
  const [activeTema, setActiveTema] = useState<TemaDocumento>(temaId);
  const tema = getTema(activeTema);
  const html = renderHtml(text);
  const showWatermark = logoBase64 && logoPosicao === "marca-dagua";
  const showCabecalho = logoBase64 && logoPosicao !== "marca-dagua";

  function handleTemaChange(id: TemaDocumento) {
    setActiveTema(id);
    onTemaChange?.(id);
  }

  return (
    <>
      <style>{PRINT_CSS}{tema.css}</style>

      <div
        style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.72)", overflowY: "auto" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px" }}>

          {/* Controls */}
          <div className="doc-controls"
            style={{ width: "100%", maxWidth: 760, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: tema.preview.accent }} />
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                Tema {tema.nome}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.print()}
                style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                </svg>
                Exportar PDF
              </button>
              <button onClick={onClose}
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                ✕ Fechar
              </button>
            </div>
          </div>

          {/* Tema switcher rápido no overlay */}
          <div className="doc-controls" style={{ width: "100%", maxWidth: 760, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PDF_THEMES.map((t) => (
                <button key={t.id} type="button" onClick={() => handleTemaChange(t.id)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    background: activeTema === t.id ? t.preview.accent : "rgba(255,255,255,0.12)",
                    color: activeTema === t.id ? "#fff" : "rgba(255,255,255,0.7)",
                    border: activeTema === t.id ? `1.5px solid ${t.preview.accent}` : "1px solid rgba(255,255,255,0.2)",
                  }}>
                  {t.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Document */}
          <div id="archia-doc" className={`tpl-${activeTema}`}
            style={{ width: "100%", maxWidth: 760, borderRadius: 10, boxShadow: "0 24px 80px rgba(0,0,0,0.4)", position: "relative", overflow: "hidden" }}>

            {showWatermark && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
                <img src={logoBase64} alt="" style={{ maxWidth: 320, maxHeight: 320, opacity: 0.08, userSelect: "none" }} />
              </div>
            )}

            <div className="doc-logo" style={{ position: "relative", zIndex: 1 }}>
              {showCabecalho
                ? <img src={logoBase64} alt="Logo" style={{ maxWidth: 120, maxHeight: 48, objectFit: "contain" }} />
                : tema.nome
              }
              {nomeEscritorio && <span>{nomeEscritorio}</span>}
            </div>

            <div style={{ position: "relative", zIndex: 1 }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Preview modal de tema ─────────────────────────────────────

function TemaPreviewModal({ temaId, onClose }: { temaId: TemaDocumento; onClose: () => void }) {
  const tema = getTema(temaId);
  const html = renderHtml(PREVIEW_MD);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--surface)", borderRadius: 16, maxWidth: 900, width: "100%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <span className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>Preview — {tema.nome}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 18 }}>✕</button>
        </div>
        <div className="overflow-y-auto p-4">
          <style>{tema.css}</style>
          <div id="archia-doc" className={`tpl-${temaId}`}
            style={{ borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            <div className="doc-logo">{tema.nome}</div>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card de tema (usado em grade e compacto) ──────────────────

function TemaCard({ tema, selected, onSelect, onPreview, compact = false }: {
  tema: typeof PDF_THEMES[0];
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  compact?: boolean;
}) {
  const p = tema.preview;
  if (compact) {
    return (
      <button type="button" onClick={onSelect}
        title={tema.nome}
        style={{
          flexShrink: 0,
          width: 52,
          border: selected ? `2px solid var(--accent)` : "1.5px solid var(--border-strong)",
          borderRadius: 10,
          overflow: "hidden",
          cursor: "pointer",
          background: selected ? "var(--accent-light)" : "var(--surface)",
          padding: 0,
          outline: "none",
          transition: "all 0.15s",
        }}>
        {/* Mini swatch */}
        <div style={{ background: p.bg, height: 36, padding: "5px 6px", borderBottom: `1px solid ${p.border}` }}>
          <div style={{ height: 2.5, width: "55%", background: p.accent, borderRadius: 2, marginBottom: 4 }} />
          {[80, 65].map((w, i) => (
            <div key={i} style={{ height: 1.5, width: `${w}%`, background: p.body, borderRadius: 1, marginBottom: 2.5, opacity: 0.35 }} />
          ))}
        </div>
        {/* Name chip */}
        <div style={{ padding: "3px 4px", textAlign: "center" }}>
          <p style={{ fontSize: 9, fontWeight: selected ? 600 : 400, color: selected ? "var(--accent)" : "var(--ink3)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tema.nome.split(" ")[0]}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{
        border: selected ? `2px solid var(--accent)` : "1px solid var(--border-strong)",
        background: selected ? "var(--accent-light)" : "var(--surface)",
      }}
      onClick={onSelect}
    >
      {/* Miniatura */}
      <div style={{ background: p.bg, padding: "14px 16px", height: 112, overflow: "hidden", borderBottom: `1px solid ${p.border}` }}>
        <div style={{ height: 4, width: "55%", background: p.accent, borderRadius: 3, marginBottom: 9 }} />
        <div style={{ height: 2.5, width: "75%", background: p.heading, borderRadius: 1.5, marginBottom: 6, opacity: 0.8 }} />
        {[92, 78, 88, 65, 80].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: p.body, borderRadius: 1, marginBottom: 4, opacity: 0.32 }} />
        ))}
      </div>

      {/* Info */}
      <div className="px-3.5 py-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: selected ? "var(--accent)" : "var(--ink)" }}>{tema.nome}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>{tema.desc}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {selected && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>
            </div>
          )}
          <button type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="text-[11px] px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ver exemplo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Picker compacto — horizontal scroll (topo dos formulários) ─

function TemaPickerCompact({ selected, onChange, label = "Tema do documento" }: {
  selected: TemaDocumento;
  onChange: (id: TemaDocumento) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<TemaDocumento | null>(null);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--ink3)" }}>
          {label}
        </p>
        <span className="text-[11px]" style={{ color: "var(--ink3)" }}>
          {getTema(selected).nome}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {PDF_THEMES.map((tema) => (
          <TemaCard key={tema.id} tema={tema} selected={selected === tema.id} compact
            onSelect={() => onChange(tema.id)}
            onPreview={() => setPreview(tema.id)} />
        ))}
      </div>
      {preview && <TemaPreviewModal temaId={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

// ── Picker grade completa (usado em Configurações e output) ───

function TemaPickerInline({ selected, onChange }: { selected: TemaDocumento; onChange: (id: TemaDocumento) => void }) {
  const [preview, setPreview] = useState<TemaDocumento | null>(null);
  return (
    <div className="mt-5">
      <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--ink3)" }}>
        Visualizar com tema
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {PDF_THEMES.map((tema) => (
          <TemaCard key={tema.id} tema={tema} selected={selected === tema.id}
            onSelect={() => onChange(tema.id)}
            onPreview={() => setPreview(tema.id)} />
        ))}
      </div>
      {preview && <TemaPreviewModal temaId={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

// ── Exports ───────────────────────────────────────────────────

export { TemaCard, TemaPickerInline, TemaPickerCompact, TemaPreviewModal };

// ── Main component ────────────────────────────────────────────

export default function TemplateRenderer({ text, isStreaming, visible, nomeEscritorio, logoBase64, logoPosicao, temaDocumento, onTemaChange }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(false);
  const [selectedTema, setSelectedTema] = useState<TemaDocumento>(temaDocumento ?? "classico");

  useEffect(() => {
    if (temaDocumento) setSelectedTema(temaDocumento);
  }, [temaDocumento]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [text]);

  if (!visible) return null;

  function handleTemaChange(id: TemaDocumento) {
    setSelectedTema(id);
    onTemaChange?.(id);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(sanitize(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tema = getTema(selectedTema);

  return (
    <>
      {/* ── Streaming / raw output ──────────────────────── */}
      <div className="mt-6 overflow-hidden"
        style={{ background: "var(--surface)", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius-lg)" }}>
        <div className="flex items-center justify-between px-4 py-3.5"
          style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ink2)" }}>
            {isStreaming && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", animation: "pulse 1.5s infinite" }} />
            )}
            {isStreaming ? "Gerando documento..." : "Documento gerado"}
          </div>
          <button onClick={handleCopy} className="text-xs px-3 py-1 rounded-md"
            style={{ color: "var(--ink2)", background: "var(--surface)", border: "0.5px solid var(--border-strong)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <div ref={bodyRef} className="px-6 py-5 text-[13px] leading-7 whitespace-pre-wrap overflow-y-auto"
          style={{ color: "var(--ink)", minHeight: 100, maxHeight: 480 }}>
          {text}
          {isStreaming && (
            <span className="inline-block ml-0.5 align-middle" style={{ animation: "blink 0.8s step-end infinite" }}>▋</span>
          )}
        </div>
      </div>

      {/* ── Tema picker (grade compacta) + botão visualizar ─ */}
      {!isStreaming && text && (
        <>
          <TemaPickerInline selected={selectedTema} onChange={handleTemaChange} />

          <button
            type="button"
            onClick={() => setActiveOverlay(true)}
            className="mt-4 flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: tema.preview.accent, color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
            </svg>
            Visualizar e exportar PDF — tema {tema.nome}
          </button>
        </>
      )}

      {/* ── Overlay do documento ───────────────────────── */}
      {activeOverlay && (
        <DocumentOverlay
          text={text}
          temaId={selectedTema}
          nomeEscritorio={nomeEscritorio}
          logoBase64={logoBase64}
          logoPosicao={logoPosicao}
          onTemaChange={handleTemaChange}
          onClose={() => setActiveOverlay(false)}
        />
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
}
