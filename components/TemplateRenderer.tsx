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
};

// ── Helpers ───────────────────────────────────────────────────

function sanitize(text: string): string {
  return text.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "");
}

function renderHtml(text: string): string {
  return String(marked.parse(sanitize(text)));
}

// ── CSS de impressão ──────────────────────────────────────────

const PRINT_CSS = `
@media print {
  @page { margin: 1.5cm 2cm; size: A4 portrait; }
  body * { visibility: hidden !important; }
  #archia-doc, #archia-doc * { visibility: visible !important; }
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
}: {
  text: string;
  temaId: TemaDocumento;
  nomeEscritorio?: string;
  logoBase64?: string;
  logoPosicao?: "cabecalho" | "marca-dagua";
  onClose: () => void;
}) {
  const tema = getTema(temaId);
  const html = renderHtml(text);
  const showWatermark = logoBase64 && logoPosicao === "marca-dagua";
  const showCabecalho = logoBase64 && logoPosicao !== "marca-dagua";

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

          {/* Document */}
          <div id="archia-doc" className={`tpl-${temaId}`}
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

// ── Preview miniatura de tema ─────────────────────────────────

function TemaPreviewModal({ temaId, onClose }: { temaId: TemaDocumento; onClose: () => void }) {
  const tema = getTema(temaId);
  const html = renderHtml(PREVIEW_MD);
  const showWatermark = false;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--surface)", borderRadius: 16, maxWidth: 640, width: "100%", maxHeight: "82vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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

// ── Card de tema ──────────────────────────────────────────────

function TemaCard({ tema, selected, onSelect, onPreview }: {
  tema: typeof PDF_THEMES[0];
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const p = tema.preview;
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
      <div style={{ background: p.bg, padding: "10px 12px", height: 80, overflow: "hidden", borderBottom: `1px solid ${p.border}` }}>
        {/* Header bar */}
        <div style={{ height: 3, width: "50%", background: p.accent, borderRadius: 2, marginBottom: 7 }} />
        {/* Title line */}
        <div style={{ height: 2, width: "70%", background: p.heading, borderRadius: 1, marginBottom: 5, opacity: 0.7 }} />
        {/* Body lines */}
        {[90, 75, 85, 60].map((w, i) => (
          <div key={i} style={{ height: 1.5, width: `${w}%`, background: p.body, borderRadius: 1, marginBottom: 3.5, opacity: 0.35 }} />
        ))}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium" style={{ color: selected ? "var(--accent)" : "var(--ink)" }}>{tema.nome}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--ink3)" }}>{tema.desc}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {selected && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>
            </div>
          )}
          <button type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="text-[10px] px-2 py-1 rounded-md transition-opacity hover:opacity-70"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ver
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Picker inline de tema (usado no TemplateRenderer) ─────────

function TemaPickerInline({ selected, onChange }: { selected: TemaDocumento; onChange: (id: TemaDocumento) => void }) {
  const [preview, setPreview] = useState<TemaDocumento | null>(null);
  return (
    <div className="mt-5">
      <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--ink3)" }}>
        Visualizar com tema
      </p>
      <div className="grid grid-cols-5 gap-2">
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

// ── Exporta o picker de temas para uso em configurações ───────

export { TemaCard, TemaPickerInline, TemaPreviewModal };

// ── Main component ────────────────────────────────────────────

export default function TemplateRenderer({ text, isStreaming, visible, nomeEscritorio, logoBase64, logoPosicao, temaDocumento }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(false);
  const [selectedTema, setSelectedTema] = useState<TemaDocumento>(temaDocumento ?? "classico");

  // Sync when prop changes (e.g. loaded from config)
  useEffect(() => {
    if (temaDocumento) setSelectedTema(temaDocumento);
  }, [temaDocumento]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [text]);

  if (!visible) return null;

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

      {/* ── Tema picker + botão visualizar ─────────────── */}
      {!isStreaming && text && (
        <>
          <TemaPickerInline selected={selectedTema} onChange={setSelectedTema} />

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
