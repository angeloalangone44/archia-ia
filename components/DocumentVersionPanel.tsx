"use client";

import { useEffect, useRef, useState } from "react";
import {
  getVersoes,
  addVersao,
  updateVersaoStatus,
  updateVersaoConteudo,
  duplicarVersao,
  type DocumentoVersao,
  type DocTipoVersao,
  type DocumentoStatus,
} from "@/lib/document-versions";

/* ── helpers ─────────────────────────────────────────────── */

const STATUS_LABEL: Record<DocumentoStatus, string> = {
  rascunho: "Rascunho",
  enviado_ao_cliente: "Enviado ao cliente",
  aprovado: "Aprovado",
};
const STATUS_COLOR: Record<DocumentoStatus, { bg: string; color: string }> = {
  rascunho:           { bg: "var(--surface2)", color: "var(--ink3)" },
  enviado_ao_cliente: { bg: "#FDF3DC",         color: "#8B6914"    },
  aprovado:           { bg: "#EAF2EC",          color: "#2D5A3D"    },
};

const ORIGEM_LABEL: Record<string, string> = {
  ia:            "Gerado por IA",
  edicao_manual: "Edição manual",
  edicao_ia:     "Revisado por IA",
};

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* ── tipos de modo de edição ─────────────────────────────── */
type EditMode = "manual" | "ia" | null;

/* ── componente principal ────────────────────────────────── */

type Props = {
  projetoId: string;
  tipo: DocTipoVersao;
  /** Texto que acabou de ser gerado pelo streaming (se houver). */
  pendingText?: string;
  /** True enquanto o streaming ainda está acontecendo. */
  isStreaming?: boolean;
};

export default function DocumentVersionPanel({ projetoId, tipo, pendingText, isStreaming }: Props) {
  const [versoes, setVersoes] = useState<DocumentoVersao[]>([]);
  const [activeVersao, setActiveVersao] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editText, setEditText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenText, setRegenText] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function reload() {
    const v = getVersoes(projetoId, tipo);
    setVersoes(v);
    if (v.length > 0 && activeVersao === null) setActiveVersao(v[v.length - 1].versao);
  }

  useEffect(() => { if (projetoId) reload(); }, [projetoId, tipo]);

  /* pending text: mostra botão para salvar como nova versão após streaming */
  const showSavePending = !!pendingText && !isStreaming && pendingText.length > 50;

  function handleSavePending() {
    if (!pendingText) return;
    const nova = addVersao(projetoId, tipo, {
      conteudo: pendingText,
      origem: "ia",
      status: "rascunho",
      timestamp: new Date().toISOString(),
    });
    reload();
    setActiveVersao(nova.versao);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  /* versão ativa */
  const versaoAtiva = versoes.find((v) => v.versao === activeVersao) ?? versoes[versoes.length - 1];

  /* ── edição manual ──────────────────────────────────────── */
  function startManual() {
    if (!versaoAtiva) return;
    setEditText(versaoAtiva.conteudo);
    setEditMode("manual");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function saveManual() {
    if (!versaoAtiva) return;
    const nova = addVersao(projetoId, tipo, {
      conteudo: editText,
      origem: "edicao_manual",
      status: "rascunho",
      timestamp: new Date().toISOString(),
    });
    reload();
    setActiveVersao(nova.versao);
    setEditMode(null);
  }

  /* ── regeneração via IA ─────────────────────────────────── */
  async function handleRegen() {
    if (!versaoAtiva || !feedback.trim()) return;
    setRegenLoading(true);
    setRegenText("");
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docOriginal: versaoAtiva.conteudo, feedback }),
      });
      if (!res.ok || !res.body) { setRegenLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setRegenText(full);
      }
      const nova = addVersao(projetoId, tipo, {
        conteudo: full,
        origem: "edicao_ia",
        status: "rascunho",
        timestamp: new Date().toISOString(),
      });
      reload();
      setActiveVersao(nova.versao);
      setEditMode(null);
      setFeedback("");
      setRegenText("");
    } finally {
      setRegenLoading(false);
    }
  }

  /* ── duplicar ───────────────────────────────────────────── */
  function handleDuplicar() {
    if (!versaoAtiva) return;
    const nova = duplicarVersao(projetoId, tipo, versaoAtiva.versao);
    if (nova) { reload(); setActiveVersao(nova.versao); }
  }

  /* ── copiar ─────────────────────────────────────────────── */
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    if (!versaoAtiva) return;
    navigator.clipboard.writeText(versaoAtiva.conteudo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── se não há projetoId, não mostra nada ─────────────────*/
  if (!projetoId) return null;

  /* ── botão de salvar versão pendente ─────────────────────── */
  if (showSavePending && versoes.length === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }}>
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" />
        </svg>
        <span className="text-[12px] flex-1" style={{ color: "var(--ink2)" }}>
          {saved ? "Versão salva!" : "Salvar este documento para editar e acompanhar versões"}
        </span>
        <button onClick={handleSavePending}
          className="text-[12px] px-3 py-1.5 rounded-lg text-white"
          style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Salvar v1
        </button>
      </div>
    );
  }

  if (showSavePending && versoes.length > 0) {
    return (
      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)" }}>
        <span className="text-[12px] flex-1" style={{ color: "var(--ink2)" }}>
          Salvar como nova versão v{versoes.length + 1}?
        </span>
        <button onClick={handleSavePending}
          className="text-[12px] px-3 py-1.5 rounded-lg text-white"
          style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Salvar
        </button>
      </div>
    );
  }

  if (versoes.length === 0) return null;

  /* ── painel principal ─────────────────────────────────────── */
  return (
    <div className="mt-6 rounded-2xl overflow-hidden"
      style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)" }}>

      {/* ── header com seletor de versões ─────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 flex-wrap"
        style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
        <span className="text-[11px] uppercase tracking-wider mr-1" style={{ color: "var(--ink3)" }}>Versões</span>

        {versoes.map((v) => (
          <button key={v.versao} onClick={() => { setActiveVersao(v.versao); setEditMode(null); }}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-colors"
            style={{
              background: activeVersao === v.versao ? "var(--accent)" : "var(--surface)",
              color: activeVersao === v.versao ? "#fff" : "var(--ink2)",
              border: activeVersao === v.versao ? "none" : "0.5px solid var(--border-strong)",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
            v{v.versao}
            <span style={{ opacity: 0.75 }}>· {ORIGEM_LABEL[v.origem].split(" ")[0]}</span>
          </button>
        ))}

        <div className="flex-1" />

        {versaoAtiva && (
          <select
            value={versaoAtiva.status}
            onChange={(e) => { updateVersaoStatus(projetoId, tipo, versaoAtiva.versao, e.target.value as DocumentoStatus); reload(); }}
            className="text-[11px] px-2.5 py-1 rounded-lg"
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: STATUS_COLOR[versaoAtiva.status].color, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" }}>
            {(Object.keys(STATUS_LABEL) as DocumentoStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        )}

        <button onClick={handleCopy} className="text-[11px] px-2.5 py-1 rounded-lg"
          style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* ── meta da versão ────────────────────────────────── */}
      {versaoAtiva && (
        <div className="flex items-center gap-4 px-4 py-2" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <span className="text-[11px]" style={{ color: "var(--ink3)" }}>
            {fmtDate(versaoAtiva.timestamp)}
          </span>
          <span className="text-[11px]" style={{ color: "var(--ink3)" }}>
            {ORIGEM_LABEL[versaoAtiva.origem]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: STATUS_COLOR[versaoAtiva.status].bg, color: STATUS_COLOR[versaoAtiva.status].color }}>
            {STATUS_LABEL[versaoAtiva.status]}
          </span>
        </div>
      )}

      {/* ── conteúdo / edição ─────────────────────────────── */}
      {editMode === null && versaoAtiva && (
        <div className="px-5 py-4 text-[13px] leading-7 whitespace-pre-wrap"
          style={{ color: "var(--ink)", maxHeight: 500, overflowY: "auto" }}>
          {versaoAtiva.conteudo}
        </div>
      )}

      {editMode === "manual" && (
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-[13px] leading-7 p-3 rounded-xl"
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none", minHeight: 320, resize: "vertical", boxSizing: "border-box" }}
          />
          <div className="flex gap-2 mt-3">
            <button onClick={saveManual}
              className="text-[12px] px-4 py-2 rounded-lg text-white"
              style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Salvar como nova versão
            </button>
            <button onClick={() => setEditMode(null)}
              className="text-[12px] px-4 py-2 rounded-lg"
              style={{ border: "0.5px solid var(--border-strong)", background: "transparent", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editMode === "ia" && (
        <div className="p-4">
          <p className="text-[12px] mb-2" style={{ color: "var(--ink2)" }}>
            O que o cliente pediu para mudar? Descreva as alterações:
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ex: O cliente quer que a proposta mencione prazo de 6 meses e remova a seção de projetos complementares."
            className="w-full text-[13px] p-3 rounded-xl"
            rows={4}
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", width: "100%" }}
          />
          {regenText && (
            <div className="mt-3 p-3 rounded-xl text-[12px] leading-6 whitespace-pre-wrap"
              style={{ background: "var(--surface2)", color: "var(--ink)", maxHeight: 260, overflowY: "auto" }}>
              {regenText}
              {regenLoading && <span style={{ animation: "blink 0.8s step-end infinite" }}>▋</span>}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={handleRegen} disabled={regenLoading || !feedback.trim()}
              className="flex items-center gap-2 text-[12px] px-4 py-2 rounded-lg text-white"
              style={{ background: "var(--accent)", border: "none", cursor: regenLoading ? "not-allowed" : "pointer", opacity: regenLoading || !feedback.trim() ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}>
              {regenLoading && <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {regenLoading ? "Revisando..." : "Revisar com IA → nova versão"}
            </button>
            <button onClick={() => { setEditMode(null); setFeedback(""); setRegenText(""); }}
              className="text-[12px] px-4 py-2 rounded-lg"
              style={{ border: "0.5px solid var(--border-strong)", background: "transparent", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── ações ─────────────────────────────────────────── */}
      {editMode === null && (
        <div className="flex gap-2 px-4 py-3 flex-wrap"
          style={{ borderTop: "0.5px solid var(--border)", background: "var(--surface2)" }}>
          <button onClick={startManual}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3 h-3">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar manualmente
          </button>
          <button onClick={() => setEditMode("ia")}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3 h-3">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Revisar com IA
          </button>
          <button onClick={handleDuplicar}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
            style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3 h-3">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Duplicar como nova versão
          </button>
        </div>
      )}

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
