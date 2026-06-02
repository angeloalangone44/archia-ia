"use client";

import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────

type Props = {
  text: string;
  isStreaming: boolean;
  visible: boolean;
};

type TemplateId = "classico" | "moderno" | "proximo";

type Segment =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "bullet"; text: string; symbol: string }
  | { type: "paragraph"; text: string };

// ── Sanitização — remove BOM e chars fora do Latin-1 ─────────
// Evita "Cannot convert argument to a BytString" no print/clipboard

function sanitize(text: string): string {
  // Remove apenas BOM (U+FEFF = 65279) — não remove chars acima de 255
  // Bullets (•), em-dashes (—) e aspas curvas são conteúdo válido gerado pela IA
  return text.replace(new RegExp(String.fromCharCode(0xFEFF), "g"), "");
}

// ── Text parser ───────────────────────────────────────────────

const BULLET_STARTS = ["•", "✓", "⚠", "- ", "* "];

function parseText(raw: string): Segment[] {
  const segments: Segment[] = [];

  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;

    // Numbered section heading: "1. ..." "2. ..." etc.
    if (/^\d+\.\s+\S/.test(t)) {
      segments.push({ type: "h1", text: t });
      continue;
    }

    // All-caps heading (not a bullet line)
    const isBullet = BULLET_STARTS.some((s) => t.startsWith(s));
    if (
      !isBullet &&
      t === t.toUpperCase() &&
      t.replace(/[\s\d.,:\-–]/g, "").length >= 3 &&
      /[A-ZÁÉÍÓÚÂÊÔÃÕÜ]/.test(t)
    ) {
      segments.push({ type: "h1", text: t });
      continue;
    }

    // Sub-heading: ends with ":", not too long, not a bullet
    if (!isBullet && t.endsWith(":") && t.length < 80) {
      segments.push({ type: "h2", text: t });
      continue;
    }

    // Bullet / list items
    const bulletMatch = t.match(/^([•✓⚠]|-\s|\*\s)\s*(.*)/);
    if (bulletMatch) {
      const sym = bulletMatch[1].trim() || "•";
      segments.push({ type: "bullet", text: bulletMatch[2].trim(), symbol: sym });
      continue;
    }

    segments.push({ type: "paragraph", text: t });
  }

  return segments;
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
    preview: {
      bg: "#FFFFFF",
      border: "#E0D8CC",
      heading: "#1A1410",
      body: "#3C3530",
      accent: "#7A5C14",
    },
  },
  {
    id: "moderno",
    name: "Moderno",
    desc: "Sans-serif · off-white · limpo",
    preview: {
      bg: "#F5F2ED",
      border: "#D8D3CB",
      heading: "#1C1C1C",
      body: "#4C4C4C",
      accent: "#2D5A3D",
    },
  },
  {
    id: "proximo",
    name: "Próximo",
    desc: "Escuro · caloroso · identidade",
    preview: {
      bg: "#2B3A2C",
      border: "#3A4D3B",
      heading: "#F0E8D5",
      body: "#B8AD96",
      accent: "#7AB87A",
    },
  },
];

// ── Per-template color palette ────────────────────────────────

const PALETTE = {
  classico: {
    h1: "#1A1410",
    h1border: "rgba(0,0,0,0.09)",
    h2: "#7A5C14",
    bullet: "#2C2520",
    bulletIcon: "#7A5C14",
    para: "#3C3530",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  moderno: {
    h1: "#1C1C1C",
    h1border: "rgba(0,0,0,0.07)",
    h2: "#2D5A3D",
    bullet: "#3C3C3C",
    bulletIcon: "#2D5A3D",
    para: "#4C4C4C",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  proximo: {
    h1: "#F0E8D5",
    h1border: "rgba(255,255,255,0.08)",
    h2: "#7AB87A",
    bullet: "#C0B59E",
    bulletIcon: "#7AB87A",
    para: "#A89E8A",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

// ── Segment renderer ──────────────────────────────────────────

function SegmentRenderer({ seg, tpl }: { seg: Segment; tpl: TemplateId }) {
  const c = PALETTE[tpl];

  if (seg.type === "h1") {
    return (
      <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${c.h1border}`, marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.h1, fontFamily: c.fontFamily, margin: 0 }}>
          {seg.text}
        </p>
      </div>
    );
  }

  if (seg.type === "h2") {
    return (
      <p style={{ fontSize: 13, fontWeight: 600, color: c.h2, marginTop: 14, marginBottom: 4, fontFamily: c.fontFamily }}>
        {seg.text}
      </p>
    );
  }

  if (seg.type === "bullet") {
    const icon = seg.symbol === "✓" ? "✓" : seg.symbol === "⚠" ? "⚠" : "·";
    return (
      <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
        <span style={{ color: c.bulletIcon, flexShrink: 0, fontSize: 14, lineHeight: "22px", width: 14, textAlign: "center" }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, lineHeight: "22px", color: c.bullet, fontFamily: c.fontFamily }}>
          {seg.text}
        </span>
      </div>
    );
  }

  return (
    <p style={{ fontSize: 13, lineHeight: "22px", color: c.para, marginTop: 8, fontFamily: c.fontFamily }}>
      {seg.text}
    </p>
  );
}

// ── Template overlay (full-screen preview + print) ────────────

function TemplateOverlay({ text, tpl, onClose }: { text: string; tpl: TemplateId; onClose: () => void }) {
  const segments = parseText(sanitize(text));
  const config = TEMPLATES.find((t) => t.id === tpl)!;

  return (
    <>
      {/* Print CSS: only #archia-doc is visible when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #archia-doc, #archia-doc * { visibility: visible; }
          #archia-doc {
            position: fixed !important;
            inset: 0 !important;
            border-radius: 0 !important;
            padding: 48px 72px !important;
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
            overflow: visible !important;
            z-index: 99999;
          }
        }
      `}</style>

      {/* Backdrop — click outside to close */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.72)", overflowY: "auto" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 48px" }}>

          {/* Controls bar */}
          <div style={{ width: "100%", maxWidth: 760, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
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
                  background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8,
                  padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
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
            style={{
              width: "100%",
              maxWidth: 760,
              background: config.preview.bg,
              borderRadius: 10,
              padding: "56px 72px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Template-specific header */}
            {tpl === "classico" && (
              <div style={{ textAlign: "center", borderBottom: "1px solid #D8D0C0", paddingBottom: 24, marginBottom: 36 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#7A5C14", fontFamily: "Georgia, serif" }}>
                  Documento de Arquitetura
                </span>
              </div>
            )}
            {tpl === "moderno" && (
              <div style={{ borderTop: "3px solid #2D5A3D", paddingTop: 20, marginBottom: 36 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2D5A3D", fontFamily: "'DM Sans', sans-serif" }}>
                  archi.ia · documento gerado com IA
                </span>
              </div>
            )}
            {tpl === "proximo" && (
              <div style={{ marginBottom: 36 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7AB87A", fontFamily: "'DM Sans', sans-serif" }}>
                  documento gerado com archi.ia
                </span>
              </div>
            )}

            {segments.map((seg, i) => (
              <SegmentRenderer key={i} seg={seg} tpl={tpl} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────

export default function TemplateRenderer({ text, isStreaming, visible }: Props) {
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
      {/* ── Raw / streaming output ─────────────────────────── */}
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
          style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ink2)" }}>
            {isStreaming && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)", animation: "pulse 1.5s infinite" }}
              />
            )}
            {isStreaming ? "Gerando documento..." : "Documento gerado"}
          </div>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-md"
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
          style={{ color: "var(--ink)", minHeight: 100, maxHeight: 480 }}
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
      </div>

      {/* ── Template picker (shown after streaming completes) ─ */}
      {!isStreaming && text && (
        <div className="mt-5">
          <p
            className="text-[11px] font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--ink3)" }}
          >
            Visualizar com template
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                style={{
                  border: "0.5px solid var(--border-strong)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: "var(--surface)",
                  textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Mini document preview */}
                <div
                  style={{
                    background: tpl.preview.bg,
                    border: `0.5px solid ${tpl.preview.border}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    marginBottom: 10,
                    height: 72,
                    overflow: "hidden",
                  }}
                >
                  {/* accent bar */}
                  <div style={{ height: 3, width: "40%", background: tpl.preview.accent, borderRadius: 2, marginBottom: 8 }} />
                  {/* fake text lines */}
                  {[100, 78, 92, 65, 85].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 2,
                        width: `${w}%`,
                        background: i === 0 ? tpl.preview.heading : tpl.preview.body,
                        borderRadius: 1,
                        marginBottom: 5,
                        opacity: i === 0 ? 0.8 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px 0" }}>
                  {tpl.name}
                </p>
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


