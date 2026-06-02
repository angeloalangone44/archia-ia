"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";

// ── Types ─────────────────────────────────────────────────────

type Props = {
  text: string;
  isStreaming: boolean;
  visible: boolean;
  nomeEscritorio?: string;
};

type TemplateId = "classico" | "moderno" | "proximo";

// ── Sanitize (strip BOM only) ─────────────────────────────────

function sanitize(text: string): string {
  return text.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "");
}

// ── Render Markdown → HTML ────────────────────────────────────

function renderHtml(text: string): string {
  return String(marked.parse(sanitize(text)));
}

// ── Template definitions ──────────────────────────────────────

const TEMPLATES: Array<{
  id: TemplateId;
  name: string;
  desc: string;
  preview: { bg: string; border: string; heading: string; body: string; accent: string };
}> = [
  {
    id: "classico",
    name: "Clássico",
    desc: "Serif · branco · formal",
    preview: { bg: "#FFFFFF", border: "#E0D8CC", heading: "#1A1410", body: "#3C3530", accent: "#7A5C14" },
  },
  {
    id: "moderno",
    name: "Moderno",
    desc: "Sans-serif · off-white · limpo",
    preview: { bg: "#F5F2ED", border: "#D8D3CB", heading: "#1C1C1C", body: "#4C4C4C", accent: "#2D5A3D" },
  },
  {
    id: "proximo",
    name: "Próximo",
    desc: "Escuro · caloroso · identidade",
    preview: { bg: "#2B3A2C", border: "#3A4D3B", heading: "#F0E8D5", body: "#B8AD96", accent: "#7AB87A" },
  },
];

// ── CSS de impressão + template ───────────────────────────────

const PRINT_CSS = `
@media print {
  @page {
    margin: 1.5cm 2cm;
    size: A4 portrait;
  }
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

const TEMPLATE_CSS: Record<TemplateId, string> = {
  classico: `
    #archia-doc.tpl-classico {
      font-family: Georgia, 'Times New Roman', serif;
      background: #FFFFFF;
      color: #1A1410;
      padding: 56px 72px;
    }
    #archia-doc.tpl-classico .doc-logo {
      font-family: Georgia, serif;
      font-size: 18px;
      letter-spacing: -0.5px;
      color: #7A5C14;
      text-align: center;
      border-bottom: 1px solid #D8D0C0;
      padding-bottom: 18px;
      margin-bottom: 32px;
    }
    #archia-doc.tpl-classico .doc-logo span {
      display: block;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #9B8060;
      margin-top: 4px;
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    #archia-doc.tpl-classico h1, #archia-doc.tpl-classico h2 {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: #1A1410; margin: 28px 0 10px;
      padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.09);
    }
    #archia-doc.tpl-classico h3 {
      font-size: 13px; font-weight: 600; color: #7A5C14;
      margin: 16px 0 6px;
    }
    #archia-doc.tpl-classico p {
      font-size: 13px; line-height: 1.85; color: #3C3530; margin: 8px 0;
    }
    #archia-doc.tpl-classico ul, #archia-doc.tpl-classico ol {
      padding-left: 20px; margin: 8px 0;
    }
    #archia-doc.tpl-classico li {
      font-size: 13px; line-height: 1.75; color: #3C3530; margin: 4px 0;
    }
    #archia-doc.tpl-classico strong { font-weight: 700; color: #1A1410; }
    #archia-doc.tpl-classico em { font-style: italic; }
    #archia-doc.tpl-classico hr {
      border: none; border-top: 1px solid #D8D0C0; margin: 24px 0;
    }
    #archia-doc.tpl-classico blockquote {
      border-left: 3px solid #D8D0C0; padding-left: 16px;
      color: #7A6A50; font-style: italic; margin: 12px 0;
    }
  `,
  moderno: `
    #archia-doc.tpl-moderno {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #F5F2ED;
      color: #1C1C1C;
      padding: 56px 72px;
    }
    #archia-doc.tpl-moderno .doc-logo {
      font-size: 11px; letter-spacing: 0.15em;
      text-transform: uppercase; color: #2D5A3D;
      padding-top: 16px; border-top: 3px solid #2D5A3D;
      margin-bottom: 32px;
    }
    #archia-doc.tpl-moderno .doc-logo span {
      display: block; font-size: 12px;
      letter-spacing: 0.05em; text-transform: none;
      color: #4C4C4C; margin-top: 6px;
    }
    #archia-doc.tpl-moderno h1, #archia-doc.tpl-moderno h2 {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: #1C1C1C; margin: 28px 0 10px;
      padding-top: 18px; border-top: 1px solid rgba(0,0,0,0.07);
    }
    #archia-doc.tpl-moderno h3 {
      font-size: 13px; font-weight: 600; color: #2D5A3D;
      margin: 16px 0 6px;
    }
    #archia-doc.tpl-moderno p {
      font-size: 13px; line-height: 1.8; color: #3C3C3C; margin: 8px 0;
    }
    #archia-doc.tpl-moderno ul, #archia-doc.tpl-moderno ol {
      padding-left: 20px; margin: 8px 0;
    }
    #archia-doc.tpl-moderno li {
      font-size: 13px; line-height: 1.7; color: #3C3C3C; margin: 4px 0;
    }
    #archia-doc.tpl-moderno strong { font-weight: 600; color: #1C1C1C; }
    #archia-doc.tpl-moderno hr {
      border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 24px 0;
    }
    #archia-doc.tpl-moderno blockquote {
      border-left: 3px solid #2D5A3D; padding-left: 16px;
      color: #6B6B6B; font-style: italic; margin: 12px 0;
    }
  `,
  proximo: `
    #archia-doc.tpl-proximo {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #2B3A2C;
      color: #F0E8D5;
      padding: 56px 72px;
    }
    #archia-doc.tpl-proximo .doc-logo {
      font-size: 11px; letter-spacing: 0.15em;
      text-transform: uppercase; color: #7AB87A;
      margin-bottom: 32px;
    }
    #archia-doc.tpl-proximo .doc-logo span {
      display: block; font-size: 12px; text-transform: none;
      letter-spacing: 0.03em; color: #B8AD96; margin-top: 6px;
    }
    #archia-doc.tpl-proximo h1, #archia-doc.tpl-proximo h2 {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: #F0E8D5; margin: 28px 0 10px;
      padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08);
    }
    #archia-doc.tpl-proximo h3 {
      font-size: 13px; font-weight: 600; color: #7AB87A;
      margin: 16px 0 6px;
    }
    #archia-doc.tpl-proximo p {
      font-size: 13px; line-height: 1.8; color: #C0B59E; margin: 8px 0;
    }
    #archia-doc.tpl-proximo ul, #archia-doc.tpl-proximo ol {
      padding-left: 20px; margin: 8px 0;
    }
    #archia-doc.tpl-proximo li {
      font-size: 13px; line-height: 1.7; color: #C0B59E; margin: 4px 0;
    }
    #archia-doc.tpl-proximo strong { font-weight: 600; color: #F0E8D5; }
    #archia-doc.tpl-proximo hr {
      border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;
    }
    #archia-doc.tpl-proximo blockquote {
      border-left: 3px solid #7AB87A; padding-left: 16px;
      color: #A89E8A; font-style: italic; margin: 12px 0;
    }
  `,
};

// ── Template overlay ──────────────────────────────────────────

function TemplateOverlay({
  text,
  tpl,
  nomeEscritorio,
  onClose,
}: {
  text: string;
  tpl: TemplateId;
  nomeEscritorio?: string;
  onClose: () => void;
}) {
  const html = renderHtml(text);
  const config = TEMPLATES.find((t) => t.id === tpl)!;

  const logoLabel =
    tpl === "classico" ? "archi·ia" :
    tpl === "moderno"  ? "archi.ia · documento gerado com IA" :
                         "documento gerado com archi.ia";

  return (
    <>
      <style>{PRINT_CSS}{TEMPLATE_CSS[tpl]}</style>

      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.72)", overflowY: "auto" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px" }}>

          {/* Controls bar */}
          <div
            className="doc-controls"
            style={{ width: "100%", maxWidth: 760, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: config.preview.accent }} />
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                Template {config.name}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: "var(--accent)", color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                </svg>
                Exportar PDF
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.1)", color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          {/* Document */}
          <div
            id="archia-doc"
            className={`tpl-${tpl}`}
            style={{ width: "100%", maxWidth: 760, borderRadius: 10, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
          >
            {/* Logo header */}
            <div className="doc-logo">
              {logoLabel}
              {nomeEscritorio && <span>{nomeEscritorio}</span>}
            </div>

            {/* Markdown content rendered as HTML */}
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>

        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────

export default function TemplateRenderer({ text, isStreaming, visible, nomeEscritorio }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId | null>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [text]);

  if (!visible) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(sanitize(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* ── Streaming / raw output ─────────────────────────── */}
      <div
        className="mt-6 overflow-hidden"
        style={{ background: "var(--surface)", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius-lg)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ink2)" }}>
            {isStreaming && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", animation: "pulse 1.5s infinite" }} />
            )}
            {isStreaming ? "Gerando documento..." : "Documento gerado"}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-md"
            style={{ color: "var(--ink2)", background: "var(--surface)", border: "0.5px solid var(--border-strong)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <div
          ref={bodyRef}
          className="px-6 py-5 text-[13px] leading-7 whitespace-pre-wrap overflow-y-auto"
          style={{ color: "var(--ink)", minHeight: 100, maxHeight: 480 }}
        >
          {text}
          {isStreaming && (
            <span className="inline-block ml-0.5 align-middle" style={{ animation: "blink 0.8s step-end infinite" }}>▋</span>
          )}
        </div>
      </div>

      {/* ── Template picker ────────────────────────────────── */}
      {!isStreaming && text && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--ink3)" }}>
            Visualizar com template
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                style={{
                  border: "0.5px solid var(--border-strong)", borderRadius: 12,
                  padding: "12px 14px", cursor: "pointer", background: "var(--surface)",
                  textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ background: tpl.preview.bg, border: `0.5px solid ${tpl.preview.border}`, borderRadius: 6, padding: "10px 12px", marginBottom: 10, height: 72, overflow: "hidden" }}>
                  <div style={{ height: 3, width: "40%", background: tpl.preview.accent, borderRadius: 2, marginBottom: 8 }} />
                  {[100, 78, 92, 65, 85].map((w, i) => (
                    <div key={i} style={{ height: 2, width: `${w}%`, background: i === 0 ? tpl.preview.heading : tpl.preview.body, borderRadius: 1, marginBottom: 5, opacity: i === 0 ? 0.8 : 0.3 }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px 0" }}>{tpl.name}</p>
                <p style={{ fontSize: 11, color: "var(--ink3)", margin: 0 }}>{tpl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template overlay */}
      {activeTemplate && (
        <TemplateOverlay
          text={text}
          tpl={activeTemplate}
          nomeEscritorio={nomeEscritorio}
          onClose={() => setActiveTemplate(null)}
        />
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
}
