"use client";

import DocumentForm, { FormGrid, FormGroup, Input, Select, Textarea } from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useRef, useState } from "react";

/* ── tipos ──────────────────────────────────────────────── */

type Fields = {
  nome: string;
  tipoProjetoQual: string;
  metragem: string;
  orcamentoFaixa: string;
  prazo: string;
  cidade: string;
  comoConheceu: string;
  descricao: string;
};

type AutoStatus = "idle" | "loading" | "success" | "error";

// Tracks which fields were auto-filled in this extraction
type AutoFilled = Partial<Record<keyof Fields, boolean>>;

/* ── seção de preenchimento automático ─────────────────── */

function AutoFillSection({ onFill }: {
  onFill: (fields: Partial<Fields>, autoFilled: AutoFilled) => void;
}) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AutoStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const fileObjRef = useRef<File | null>(null);

  async function handleExtract() {
    if (!text.trim() && !fileObjRef.current) {
      setErrorMsg("Cole um texto ou envie um arquivo para continuar.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const fd = new FormData();
      if (text.trim()) fd.append("text", text.trim());
      if (fileObjRef.current) fd.append("file", fileObjRef.current);

      const res = await fetch("/api/extract-fields", { method: "POST", body: fd });
      const json = await res.json() as { fields?: Record<string, string | null>; error?: string };
      if (!res.ok || json.error) {
        setErrorMsg(json.error ?? "Erro desconhecido.");
        setStatus("error");
        return;
      }

      const raw = json.fields ?? {};
      // Map extracted keys → form fields
      const mapped: Partial<Fields> = {};
      const autoFilled: AutoFilled = {};

      if (raw.nome)          { mapped.nome = raw.nome;                 autoFilled.nome = true; }
      if (raw.metragem)      { mapped.metragem = raw.metragem;         autoFilled.metragem = true; }
      if (raw.prazo)         { mapped.prazo = raw.prazo;               autoFilled.prazo = true; }
      if (raw.localizacao)   { mapped.cidade = raw.localizacao;        autoFilled.cidade = true; }
      if (raw.como_conheceu) { mapped.comoConheceu = raw.como_conheceu; autoFilled.comoConheceu = true; }
      if (raw.descricao)     { mapped.descricao = raw.descricao;       autoFilled.descricao = true; }

      // tipo_projeto: map to Select options
      if (raw.tipo_projeto) {
        const tp = raw.tipo_projeto.toLowerCase();
        const map: Record<string, string> = {
          residencial: "Residencial", comercial: "Comercial",
          reforma: "Reforma", interiores: "Interiores",
        };
        const found = Object.keys(map).find((k) => tp.includes(k));
        if (found) { mapped.tipoProjetoQual = map[found]; autoFilled.tipoProjetoQual = true; }
      }

      // orcamento: try to match to Select options
      if (raw.orcamento) {
        const v = raw.orcamento.toLowerCase().replace(/\s/g, "").replace(/\./g, "").replace(/,/g, "");
        const num = parseInt(v.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num)) {
          if (num < 100000)       mapped.orcamentoFaixa = "Até R$ 100.000";
          else if (num < 300000)  mapped.orcamentoFaixa = "R$ 100.000 – R$ 300.000";
          else if (num < 500000)  mapped.orcamentoFaixa = "R$ 300.000 – R$ 500.000";
          else                    mapped.orcamentoFaixa = "Acima de R$ 500.000";
          autoFilled.orcamentoFaixa = true;
        }
      }

      const hasSomething = Object.keys(mapped).length > 0;
      if (!hasSomething) {
        setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
        setStatus("error");
        return;
      }

      onFill(mapped, autoFilled);
      setStatus("success");
    } catch {
      setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
      setStatus("error");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Arquivo muito grande. Máximo 5MB.");
      setStatus("error");
      return;
    }
    fileObjRef.current = file;
    setFileName(file.name);
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border-strong)" }}>
      {/* Header */}
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:opacity-80"
        style={{ background: "var(--surface2)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px]">⚡</span>
          <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            Preenchimento automático
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}>
            opcional
          </span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 transition-transform"
          style={{ color: "var(--ink3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4" style={{ background: "var(--surface)" }}>
          <p className="text-[12px] mb-4" style={{ color: "var(--ink3)" }}>
            Cole a mensagem do cliente ou envie um print/documento — a IA preenche os campos abaixo automaticamente
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Texto */}
            <div>
              <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Mensagem ou texto</p>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                placeholder={"Cole aqui a mensagem do WhatsApp, e-mail ou descrição que o cliente enviou..."}
                className="w-full text-[12px] px-3 py-2.5 rounded-xl resize-none"
                rows={5}
                style={{
                  border: "0.5px solid var(--border-strong)",
                  background: "var(--surface2)",
                  color: "var(--ink)",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>

            {/* Upload */}
            <div>
              <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Ou envie um print/documento</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:opacity-80"
                style={{
                  border: "0.5px dashed var(--border-strong)",
                  background: "var(--surface2)",
                  cursor: "pointer",
                  height: 116,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                {fileName ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" style={{ color: "var(--accent)" }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[11px] text-center px-2 break-all" style={{ color: "var(--ink2)" }}>{fileName}</span>
                    <span className="text-[10px]" style={{ color: "var(--ink3)" }}>Clique para trocar</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" style={{ color: "var(--ink3)" }}>
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[12px]" style={{ color: "var(--ink3)" }}>JPG, PNG ou PDF</span>
                    <span className="text-[10px]" style={{ color: "var(--ink3)" }}>até 5MB</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Status messages */}
          {status === "error" && (
            <div className="mt-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-xl"
              style={{ background: "#FDEDEC", color: "#C0392B", border: "0.5px solid #F5B7B1" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {errorMsg}
            </div>
          )}
          {status === "success" && (
            <div className="mt-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-xl"
              style={{ background: "#EAF2EC", color: "#2D5A3D", border: "0.5px solid #A8D5B2" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Campos preenchidos automaticamente — revise antes de gerar o relatório
            </div>
          )}

          {/* Botão */}
          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={handleExtract} disabled={status === "loading"}
              className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl text-white transition-opacity"
              style={{
                background: "var(--accent)",
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}>
              {status === "loading" ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processando...</>
              ) : (
                <><span>⚡</span>Preencher campos automaticamente</>
              )}
            </button>
          </div>

          {/* Aviso de privacidade */}
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "var(--ink3)" }}>
            O conteúdo colado ou enviado é processado para extração e não é armazenado. Pode conter dados pessoais do cliente — use com discrição.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── indicador de campo auto-preenchido ─────────────────── */

function AutoBadge() {
  return (
    <span title="Preenchido automaticamente" className="text-[10px] ml-1 inline-flex items-center">
      ✨
    </span>
  );
}

/* ── página principal ───────────────────────────────────── */

export default function QualificacaoPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState<Fields>({
    nome: "",
    tipoProjetoQual: "",
    metragem: "",
    orcamentoFaixa: "",
    prazo: "",
    cidade: "",
    comoConheceu: "",
    descricao: "",
  });

  const [autoFilled, setAutoFilled] = useState<AutoFilled>({});

  const set = (k: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setF((prev) => ({ ...prev, [k]: e.target.value }));
      // Clear auto-fill indicator when user edits
      if (autoFilled[k]) setAutoFilled((prev) => ({ ...prev, [k]: false }));
    };

  function handleAutoFill(fields: Partial<Fields>, filled: AutoFilled) {
    setF((prev) => ({ ...prev, ...fields }));
    setAutoFilled(filled);
  }

  function handleSubmit() {
    if (!f.nome || !f.tipoProjetoQual || !f.descricao) {
      alert("Preencha pelo menos: nome, tipo de projeto e descrição.");
      return;
    }
    generate("qualificacao", f, f.nome);
  }

  // Label wrapper with auto-fill badge
  function Label({ field, children }: { field: keyof Fields; children: React.ReactNode }) {
    return (
      <span>
        {children}
        {autoFilled[field] && <AutoBadge />}
      </span>
    );
  }

  // Input border style when auto-filled
  function autoStyle(field: keyof Fields): React.CSSProperties {
    return autoFilled[field]
      ? { border: "1px solid var(--accent)", background: "var(--accent-light)" }
      : {};
  }

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Qualificação de cliente
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Enviado pelo cliente antes da primeira reunião — a IA gera seu relatório de qualificação
        </p>
      </div>

      {/* Preenchimento automático */}
      <AutoFillSection onFill={handleAutoFill} />

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar relatório de qualificação">
        <FormGrid>
          <FormGroup label={<Label field="nome">Nome completo</Label>} required>
            <Input
              placeholder="Ex: Ana Paula Ferreira"
              value={f.nome}
              onChange={set("nome")}
              style={autoStyle("nome")}
            />
          </FormGroup>

          <FormGroup label={<Label field="tipoProjetoQual">Tipo de projeto</Label>} required>
            <Select value={f.tipoProjetoQual} onChange={set("tipoProjetoQual")} style={autoStyle("tipoProjetoQual")}>
              <option value="">Selecione...</option>
              <option>Residencial</option>
              <option>Comercial</option>
              <option>Reforma</option>
              <option>Interiores</option>
            </Select>
          </FormGroup>

          <FormGroup label={<Label field="metragem">Metragem estimada</Label>}>
            <Input
              placeholder="Ex: 120 m²"
              value={f.metragem}
              onChange={set("metragem")}
              style={autoStyle("metragem")}
            />
          </FormGroup>

          <FormGroup label={<Label field="orcamentoFaixa">Orçamento disponível</Label>}>
            <Select value={f.orcamentoFaixa} onChange={set("orcamentoFaixa")} style={autoStyle("orcamentoFaixa")}>
              <option value="">Selecione uma faixa...</option>
              <option>Até R$ 100.000</option>
              <option>R$ 100.000 – R$ 300.000</option>
              <option>R$ 300.000 – R$ 500.000</option>
              <option>Acima de R$ 500.000</option>
            </Select>
          </FormGroup>

          <FormGroup label={<Label field="prazo">Prazo desejado</Label>}>
            <Input
              placeholder="Ex: 8 meses, início em março"
              value={f.prazo}
              onChange={set("prazo")}
              style={autoStyle("prazo")}
            />
          </FormGroup>

          <FormGroup label={<Label field="cidade">Cidade / bairro</Label>}>
            <Input
              placeholder="Ex: Moema, São Paulo"
              value={f.cidade}
              onChange={set("cidade")}
              style={autoStyle("cidade")}
            />
          </FormGroup>

          <FormGroup label={<Label field="comoConheceu">Como conheceu o arquiteto</Label>} full>
            <Input
              placeholder="Ex: indicação de amigo, Instagram, Google..."
              value={f.comoConheceu}
              onChange={set("comoConheceu")}
              style={autoStyle("comoConheceu")}
            />
          </FormGroup>

          <FormGroup label={<Label field="descricao">Descreva em poucas linhas o que você está buscando</Label>} required full>
            <Textarea
              placeholder={"Ex: quero reformar meu apartamento de 90m² no Brooklin. Busco um ambiente mais integrado, com personalidade, sem ser excessivamente formal. Tenho 2 filhos pequenos e um cachorro..."}
              value={f.descricao}
              onChange={set("descricao")}
              style={{ minHeight: 100, ...(autoFilled.descricao ? { border: "1px solid var(--accent)", background: "var(--accent-light)" } : {}) }}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
