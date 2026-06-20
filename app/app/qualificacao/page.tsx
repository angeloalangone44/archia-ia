"use client";

import DocumentForm, { FormGrid, FormGroup, Input, Select, Textarea } from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useEffect, useRef, useState } from "react";

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
type AutoFilled = Partial<Record<keyof Fields, boolean>>;
type FillMode = "manual" | "import" | null;

/* ── botão de link para cliente ────────────────────────── */

function QualClientLinkButton() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  function handleGenerate() {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    setLink(`${window.location.origin}/qualificacao/${token}`);
  }
  function handleCopy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  if (link) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0"
        style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", maxWidth: 320 }}>
        <span className="text-[11px] truncate flex-1" style={{ color: "var(--ink3)", fontFamily: "monospace" }}>{link}</span>
        <button onClick={handleCopy} className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg text-white"
          style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={handleGenerate}
      className="flex-shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg transition-colors"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
      Formulário para o cliente
    </button>
  );
}

/* ── banner de dados do cliente ─────────────────────────── */

function QualClientDataBanner({ onLoad }: { onLoad: (data: Record<string, string>) => void }) {
  const [show, setShow] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#client=")) {
      try {
        const decoded = JSON.parse(atob(hash.slice("#client=".length)));
        setPendingData(decoded);
        setShow(true);
        window.history.replaceState(null, "", window.location.pathname);
      } catch { /* ignore */ }
    }
  }, []);
  if (!show || !pendingData) return null;
  return (
    <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "#EAF2EC", border: "1px solid #A8D5B2" }}>
      <div className="text-lg">📋</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium" style={{ color: "#1A3A1A" }}>Cliente preencheu a qualificação — carregar respostas?</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#3A5A3A" }}>
          {pendingData.nome ? `${pendingData.nome} · ` : ""}{Object.keys(pendingData).length} campos preenchidos
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onLoad(pendingData); setShow(false); }} className="text-[12px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#2D5A3D", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Carregar respostas
          </button>
          <button onClick={() => setShow(false)} className="text-[12px] px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", border: "0.5px solid #A8D5B2", color: "#3A5A3A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── seleção de modo ────────────────────────────────────── */

function ModePicker({ onSelect }: { onSelect: (m: "manual" | "import") => void }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-medium mb-1" style={{ color: "var(--ink)" }}>
        Como você quer preencher?
      </h2>
      <p className="text-[12px] mb-5" style={{ color: "var(--ink3)" }}>
        Escolha a forma de entrada — em ambos os casos o formulário final é o mesmo.
      </p>
      <div className="grid grid-cols-2 gap-4">

        {/* Manual */}
        <button type="button" onClick={() => onSelect("manual")}
          className="flex flex-col items-start gap-3 text-left p-5 rounded-2xl transition-all hover:opacity-90 group"
          style={{ border: "1.5px solid var(--border-strong)", background: "var(--surface)", cursor: "pointer" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-light)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"
              style={{ color: "var(--accent)" }}>
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium mb-1" style={{ color: "var(--ink)" }}>
              Preencher manualmente
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink3)" }}>
              Preencha os campos você mesmo com as informações do cliente
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium mt-auto"
            style={{ color: "var(--accent)" }}>
            Começar
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </button>

        {/* Import */}
        <button type="button" onClick={() => onSelect("import")}
          className="flex flex-col items-start gap-3 text-left p-5 rounded-2xl transition-all hover:opacity-90"
          style={{ border: "1.5px solid var(--accent)", background: "var(--accent-light)", cursor: "pointer" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-white">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium mb-1" style={{ color: "var(--accent)" }}>
              Importar conversa ou print
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink2)" }}>
              Cole uma mensagem do cliente ou envie um print/documento — a IA preenche para você
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium mt-auto"
            style={{ color: "var(--accent)" }}>
            Usar IA para preencher
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </button>

      </div>
    </div>
  );
}

/* ── seção de preenchimento automático ─────────────────── */

function AutoFillSection({ onFill }: {
  onFill: (fields: Partial<Fields>, autoFilled: AutoFilled) => void;
}) {
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
      const mapped: Partial<Fields> = {};
      const filled: AutoFilled = {};

      if (raw.nome)           { mapped.nome           = raw.nome;           filled.nome           = true; }
      if (raw.localizacao)    { mapped.cidade          = raw.localizacao;    filled.cidade         = true; }
      if (raw.metragem)       { mapped.metragem        = raw.metragem;       filled.metragem       = true; }
      if (raw.prazo)          { mapped.prazo           = raw.prazo;          filled.prazo          = true; }
      if (raw.descricao)      { mapped.descricao       = raw.descricao;      filled.descricao      = true; }
      if (raw.como_conheceu)  { mapped.comoConheceu    = raw.como_conheceu;  filled.comoConheceu   = true; }
      if (raw.tipo_projeto) {
        const tp = raw.tipo_projeto.toLowerCase();
        const tipo = tp.includes("comercial") ? "Comercial"
          : tp.includes("reforma") ? "Reforma"
          : tp.includes("interior") ? "Interiores"
          : "Residencial";
        mapped.tipoProjetoQual = tipo;
        filled.tipoProjetoQual = true;
      }
      if (raw.orcamento) {
        const n = parseFloat(raw.orcamento.replace(/\D/g, "")) || 0;
        mapped.orcamentoFaixa = n > 500000 ? "Acima de R$ 500.000"
          : n > 300000 ? "R$ 300.000 – R$ 500.000"
          : n > 100000 ? "R$ 100.000 – R$ 300.000"
          : "Até R$ 100.000";
        filled.orcamentoFaixa = true;
      }

      if (Object.keys(mapped).length === 0) {
        setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
        setStatus("error"); return;
      }

      onFill(mapped, filled);
      setStatus("success");
    } catch {
      setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
      setStatus("error");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg("Arquivo muito grande. Máximo 5MB."); setStatus("error"); return; }
    fileObjRef.current = file;
    setFileName(file.name);
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border-strong)" }}>
      <div className="px-5 py-4" style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px]">⚡</span>
          <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Importar conversa ou print</span>
        </div>
        <p className="text-[12px] mt-1" style={{ color: "var(--ink3)" }}>
          Cole a mensagem do cliente ou envie um print — a IA preenche os campos abaixo automaticamente
        </p>
      </div>

      <div className="px-5 pb-5 pt-4" style={{ background: "var(--surface)" }}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Mensagem ou texto</p>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setStatus("idle"); setErrorMsg(""); }}
              placeholder={"Cole aqui a mensagem do WhatsApp, e-mail ou descrição que o cliente enviou..."}
              className="w-full text-[12px] px-3 py-2.5 rounded-xl resize-none"
              rows={5}
              style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>
          <div>
            <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Ou envie um print/documento</p>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:opacity-80"
              style={{ border: "0.5px dashed var(--border-strong)", background: "var(--surface2)", cursor: "pointer", height: 116, fontFamily: "'DM Sans', sans-serif" }}>
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
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

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

        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={handleExtract} disabled={status === "loading"}
            className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl text-white transition-opacity"
            style={{ background: "var(--accent)", border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            {status === "loading" ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processando...</>
            ) : (
              <><span>⚡</span>Preencher campos automaticamente</>
            )}
          </button>
        </div>
        <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "var(--ink3)" }}>
          O conteúdo colado ou enviado é processado para extração e não é armazenado. Pode conter dados pessoais do cliente — use com discrição.
        </p>
      </div>
    </div>
  );
}

/* ── indicador de campo auto-preenchido ─────────────────── */

function AutoBadge() {
  return <span title="Preenchido automaticamente" className="text-[10px] ml-1 inline-flex items-center">✨</span>;
}

/* ── página principal ───────────────────────────────────── */

export default function QualificacaoPage() {
  const { text, isLoading, visible, generate } = useGenerate();
  const [fillMode, setFillMode] = useState<FillMode>(null);

  const [f, setF] = useState<Fields>({
    nome: "", tipoProjetoQual: "", metragem: "", orcamentoFaixa: "",
    prazo: "", cidade: "", comoConheceu: "", descricao: "",
  });

  const [autoFilled, setAutoFilled] = useState<AutoFilled>({});

  const set = (k: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setF((prev) => ({ ...prev, [k]: e.target.value }));
      if (autoFilled[k]) setAutoFilled((prev) => ({ ...prev, [k]: false }));
    };

  function handleAutoFill(fields: Partial<Fields>, filled: AutoFilled) {
    setF((prev) => ({ ...prev, ...fields }));
    setAutoFilled(filled);
    // Após auto-fill bem-sucedido, avança para modo manual para mostrar o formulário preenchido
    setFillMode("manual");
  }

  function handleLoadClientData(data: Record<string, string>) {
    setF((prev) => ({
      ...prev,
      ...(data.nome && { nome: data.nome }),
      ...(data.tipoProjetoQual && { tipoProjetoQual: data.tipoProjetoQual }),
      ...(data.metragem && { metragem: data.metragem }),
      ...(data.orcamentoFaixa && { orcamentoFaixa: data.orcamentoFaixa }),
      ...(data.prazo && { prazo: data.prazo }),
      ...(data.cidade && { cidade: data.cidade }),
      ...(data.comoConheceu && { comoConheceu: data.comoConheceu }),
      ...(data.descricao && { descricao: data.descricao }),
    }));
    if (fillMode === null) setFillMode("manual");
  }

  function handleSubmit() {
    if (!f.nome || !f.tipoProjetoQual || !f.descricao) {
      alert("Preencha pelo menos: nome, tipo de projeto e descrição.");
      return;
    }
    generate("qualificacao", f, f.nome);
  }

  function Label({ field, children }: { field: keyof Fields; children: React.ReactNode }) {
    return <span>{children}{autoFilled[field] && <AutoBadge />}</span>;
  }

  function autoStyle(field: keyof Fields): React.CSSProperties {
    return autoFilled[field] ? { border: "1px solid var(--accent)", background: "var(--accent-light)" } : {};
  }

  const hasAnyAutoFill = Object.values(autoFilled).some(Boolean);

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Qualificação de cliente
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Enviado pelo cliente antes da primeira reunião — a IA gera seu relatório de qualificação
          </p>
        </div>
        <QualClientLinkButton />
      </div>

      <QualClientDataBanner onLoad={handleLoadClientData} />

      {/* ── Seletor de modo ─────────────────────────────── */}
      {fillMode === null && <ModePicker onSelect={setFillMode} />}

      {/* ── Link para trocar modo ────────────────────────── */}
      {fillMode !== null && (
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: fillMode === "import" ? "var(--accent)" : "var(--ink3)" }} />
            <span className="text-[12px]" style={{ color: "var(--ink3)" }}>
              {fillMode === "import" ? "Modo: importar conversa ou print" : "Modo: preenchimento manual"}
              {hasAnyAutoFill && " · campos preenchidos automaticamente ✨"}
            </span>
          </div>
          <button type="button" onClick={() => setFillMode(null)}
            className="text-[11px] underline"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontFamily: "'DM Sans', sans-serif" }}>
            Trocar forma de preenchimento
          </button>
        </div>
      )}

      {/* ── Auto-fill section (só no modo import) ────────── */}
      {fillMode === "import" && <AutoFillSection onFill={handleAutoFill} />}

      {/* ── Formulário (visível quando modo selecionado) ─── */}
      {fillMode !== null && (
        <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar relatório de qualificação">
          <FormGrid>
            <FormGroup label={<Label field="nome">Nome completo</Label>} required>
              <Input placeholder="Ex: Ana Paula Ferreira" value={f.nome} onChange={set("nome")} style={autoStyle("nome")} />
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
              <Input placeholder="Ex: 120 m²" value={f.metragem} onChange={set("metragem")} style={autoStyle("metragem")} />
            </FormGroup>

            <FormGroup label={<Label field="orcamentoFaixa">Orçamento disponível</Label>}>
              <Input placeholder="Ex: R$ 150.000 ou em torno de R$ 200–300k" value={f.orcamentoFaixa} onChange={set("orcamentoFaixa")} style={autoStyle("orcamentoFaixa")} />
              <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "var(--ink3)" }}>
                Não se preocupe em ter certeza — uma estimativa inicial já ajuda.
              </p>
            </FormGroup>

            <FormGroup label={<Label field="prazo">Prazo desejado</Label>}>
              <Input placeholder="Ex: 8 meses, início em março" value={f.prazo} onChange={set("prazo")} style={autoStyle("prazo")} />
              <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "var(--ink3)" }}>
                Se não souber, deixe em branco — o arquiteto vai te orientar sobre prazos realistas.
              </p>
            </FormGroup>

            <FormGroup label={<Label field="cidade">Cidade / bairro</Label>}>
              <Input placeholder="Ex: Moema, São Paulo" value={f.cidade} onChange={set("cidade")} style={autoStyle("cidade")} />
            </FormGroup>

            <FormGroup label={<Label field="comoConheceu">Como conheceu o arquiteto</Label>} full>
              <Input placeholder="Ex: indicação de amigo, Instagram, Google..." value={f.comoConheceu} onChange={set("comoConheceu")} style={autoStyle("comoConheceu")} />
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
      )}

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
