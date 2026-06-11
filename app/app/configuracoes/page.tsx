"use client";

import { useEffect, useRef, useState } from "react";
import {
  getConfiguracoesOrDefault,
  saveConfiguracoes,
  ETAPAS_PADRAO,
  type EtapaConfig,
  type LogoPosicao,
} from "@/lib/configuracoes";
import { PDF_THEMES, getTema, type TemaDocumento } from "@/lib/pdf-themes";
import { TemaCard, TemaPreviewModal } from "@/components/TemplateRenderer";
import { Input, FormGroup, SectionDivider } from "@/components/DocumentForm";
import { getModelo, saveModelo, deleteModelo, type TipoModelo } from "@/lib/db/modelos";

/* ── Editor de modelo (colar texto + upload) ─────────────── */

function ModeloEditor({ tipo, label }: { tipo: TipoModelo; label: string }) {
  const [tab, setTab] = useState<"colar" | "upload">("colar");
  const [texto, setTexto] = useState("");
  const [preview, setPreview] = useState("");
  const [existente, setExistente] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getModelo(tipo).then((m) => {
      if (m) setExistente(m.conteudo.slice(0, 120) + (m.conteudo.length > 120 ? "…" : ""));
    });
  }, [tipo]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/extract-text", { method: "POST", body: fd });
    const json = await res.json();
    if (json.error) {
      setError(json.error);
    } else {
      setTexto(json.text);
      setPreview(json.preview);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    if (!texto.trim()) return;
    setSaving(true);
    try {
      await saveModelo(tipo, texto.trim());
      setExistente(texto.trim().slice(0, 120) + (texto.trim().length > 120 ? "…" : ""));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Erro ao salvar. Verifique sua conexão.");
    }
    setSaving(false);
  }

  async function handleRemove() {
    if (!confirm("Remover modelo? O sistema voltará ao padrão.")) return;
    await deleteModelo(tipo);
    setExistente(null);
    setTexto("");
    setPreview("");
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: 500,
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : "var(--ink2)",
  });

  return (
    <div>
      <p className="text-[12px] mb-3 font-medium" style={{ color: "var(--ink)" }}>{label}</p>

      {existente && (
        <div className="mb-3 px-3 py-2.5 rounded-xl text-[12px]"
          style={{ background: "var(--accent-light)", border: "1px solid rgba(45,90,61,0.2)", color: "var(--accent)" }}>
          <span className="font-medium">Modelo salvo:</span>{" "}
          <span style={{ color: "var(--ink2)" }}>{existente}</span>
          <button onClick={handleRemove}
            style={{ marginLeft: 8, background: "none", border: "none", color: "#DC2626", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Remover
          </button>
        </div>
      )}

      <div className="flex gap-1 mb-3 p-1 rounded-lg w-fit" style={{ background: "var(--surface2)" }}>
        <button style={tabStyle(tab === "colar")} onClick={() => setTab("colar")}>Colar texto</button>
        <button style={tabStyle(tab === "upload")} onClick={() => setTab("upload")}>Upload de arquivo</button>
      </div>

      {tab === "colar" ? (
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          placeholder={`Cole aqui um ${label.toLowerCase()} anterior como referência de estrutura e tom...`}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: "var(--radius)",
            border: "0.5px solid var(--border-strong)", background: "var(--surface2)",
            color: "var(--ink)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
            resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />
      ) : (
        <div>
          <label style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px",
            border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius)",
            cursor: "pointer", background: "var(--surface2)",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20} style={{ color: "var(--ink3)" }}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 10l-4-4-4 4M12 6v8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink)", fontWeight: 500 }}>
                {uploading ? "Extraindo texto..." : "Selecionar arquivo"}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--ink3)" }}>.pdf, .docx, .txt — máx. 2MB</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} style={{ display: "none" }} />
          </label>

          {preview && (
            <div className="mt-3 px-3 py-2.5 rounded-xl text-[12px]"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 500, color: "var(--ink2)" }}>Preview (primeiros 300 caracteres):</p>
              <p style={{ margin: 0, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{preview}</p>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#DC2626" }}>{error}</p>}

      {texto && (
        <div className="flex items-center gap-3 mt-3">
          <button onClick={handleSave} disabled={saving}
            style={{
              padding: "7px 16px", background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "var(--radius)", fontSize: "12px",
              fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? "Salvando..." : "Salvar modelo"}
          </button>
          {saved && <span style={{ fontSize: "12px", color: "var(--accent)" }}>✓ Salvo</span>}
        </div>
      )}
    </div>
  );
}

/* ── Editor de etapas ───────────────────────────────────── */

function EtapasEditor({
  etapas,
  onChange,
}: {
  etapas: EtapaConfig[];
  onChange: (etapas: EtapaConfig[]) => void;
}) {
  function setNome(id: string, nome: string) {
    onChange(etapas.map((e) => (e.id === id ? { ...e, nome } : e)));
  }
  function setHoras(id: string, horas: number) {
    onChange(etapas.map((e) => (e.id === id ? { ...e, horas } : e)));
  }
  function remove(id: string) {
    onChange(etapas.filter((e) => e.id !== id));
  }
  function add() {
    onChange([
      ...etapas,
      { id: crypto.randomUUID(), nome: "Nova etapa", horas: 8 },
    ]);
  }

  return (
    <div>
      <div className="flex flex-col gap-2 mb-3">
        {etapas.map((etapa, idx) => (
          <div key={etapa.id} className="flex items-center gap-2">
            {/* drag handle visual (sem drag funcional — simples) */}
            <span className="text-[11px] w-5 text-center flex-shrink-0"
              style={{ color: "var(--ink3)", userSelect: "none" }}>
              {idx + 1}
            </span>
            <input
              type="text"
              value={etapa.nome}
              onChange={(e) => setNome(etapa.id, e.target.value)}
              className="flex-1 text-[13px] px-3 py-2 rounded-lg"
              style={{
                border: "0.5px solid var(--border-strong)",
                background: "var(--surface2)",
                color: "var(--ink)",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                value={etapa.horas}
                onChange={(e) => setHoras(etapa.id, parseFloat(e.target.value) || 0)}
                className="text-[13px] text-center rounded-lg"
                style={{
                  width: 56,
                  border: "0.5px solid var(--border-strong)",
                  background: "var(--surface2)",
                  color: "var(--ink)",
                  padding: "8px 4px",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
              <span className="text-[11px] w-4" style={{ color: "var(--ink3)" }}>h</span>
            </div>
            <button
              type="button"
              onClick={() => remove(etapa.id)}
              title="Remover etapa"
              className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="text-[12px] flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors"
        style={{
          background: "var(--surface2)",
          border: "0.5px solid var(--border-strong)",
          color: "var(--ink2)",
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Adicionar etapa
      </button>
    </div>
  );
}

/* ── Página ─────────────────────────────────────────────── */

export default function ConfiguracoesPage() {
  const [valorHora,    setValorHora]    = useState("");
  const [horasMensais, setHorasMensais] = useState("");
  const [margemLucro,  setMargemLucro]  = useState("");
  const [custosFixos,  setCustosFixos]  = useState("");
  const [horasM2Res,   setHorasM2Res]   = useState("1.5");
  const [horasM2Com,   setHorasM2Com]   = useState("1.2");
  const [etapas,       setEtapas]       = useState(ETAPAS_PADRAO);
  const [saved,        setSaved]        = useState(false);
  // Logo
  const [logoBase64,      setLogoBase64]      = useState<string | undefined>(undefined);
  const [logoPosicao,     setLogoPosicao]     = useState<LogoPosicao>("cabecalho");
  const [logoError,       setLogoError]       = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  // Tema do documento
  const [temaDocumento,   setTemaDocumento]   = useState<TemaDocumento>("classico");
  const [temaPreview,     setTemaPreview]     = useState<TemaDocumento | null>(null);

  useEffect(() => {
    const c = getConfiguracoesOrDefault();
    setValorHora   (String(c.valorHora    || ""));
    setHorasMensais(String(c.horasMensais || ""));
    setMargemLucro (String(c.margemLucro  || ""));
    setCustosFixos (String(c.custosFixos  || ""));
    setHorasM2Res  (String(c.horasM2Residencial ?? 1.5));
    setHorasM2Com  (String(c.horasM2Comercial   ?? 1.2));
    setEtapas      (c.etapas.length > 0 ? c.etapas : ETAPAS_PADRAO);
    setLogoBase64     (c.logoBase64);
    setLogoPosicao    (c.logoPosicao    ?? "cabecalho");
    setTemaDocumento  (c.temaDocumento  ?? "classico");
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    if (file.size > 1 * 1024 * 1024) { setLogoError("Logo muito grande. Máximo 1MB."); return; }
    const allowed = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!allowed.includes(file.type)) { setLogoError("Formato não suportado. Use PNG, JPG ou SVG."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleSave() {
    if (!valorHora) { alert("Informe o valor da sua hora."); return; }
    saveConfiguracoes({
      valorHora:           parseFloat(valorHora)    || 0,
      horasMensais:        parseFloat(horasMensais) || 0,
      margemLucro:         parseFloat(margemLucro)  || 0,
      custosFixos:         parseFloat(custosFixos)  || 0,
      etapas,
      horasM2Residencial:  parseFloat(horasM2Res)   || 1.5,
      horasM2Comercial:    parseFloat(horasM2Com)   || 1.2,
      logoBase64,
      logoPosicao,
      temaDocumento,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function resetEtapas() {
    if (confirm("Restaurar etapas padrão? As etapas atuais serão substituídas.")) {
      setEtapas(ETAPAS_PADRAO.map((e) => ({ ...e, id: crypto.randomUUID() })));
    }
  }

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Configurações</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Perfil do escritório — salvo localmente no seu navegador
        </p>
      </div>

      <div className="flex flex-col gap-5">

        {/* Dados base */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <SectionDivider>Precificação do escritório</SectionDivider>
          <p className="text-[12px] mb-5 leading-relaxed" style={{ color: "var(--ink3)" }}>
            Configure uma vez — a calculadora usa esses valores como base para todos os projetos.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Valor da sua hora (R$)" required>
              <Input type="number" placeholder="Ex: 150" value={valorHora}
                onChange={(e) => setValorHora(e.target.value)} />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Quanto você cobra ou quer cobrar por hora
              </p>
            </FormGroup>

            <FormGroup label="Horas disponíveis por mês">
              <Input type="number" placeholder="Ex: 120" value={horasMensais}
                onChange={(e) => setHorasMensais(e.target.value)} />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Horas para projetos, descontando reuniões e admin
              </p>
            </FormGroup>

            <FormGroup label="Margem de lucro desejada (%)">
              <Input type="number" placeholder="Ex: 30" value={margemLucro}
                onChange={(e) => setMargemLucro(e.target.value)} />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Percentual de lucro acima do custo operacional
              </p>
            </FormGroup>

            <FormGroup label="Custos fixos mensais (R$)">
              <Input type="number" placeholder="Ex: 2000" value={custosFixos}
                onChange={(e) => setCustosFixos(e.target.value)} />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Aluguel, softwares, contador... Melhora a precisão.
              </p>
            </FormGroup>
          </div>
        </div>

        {/* Horas por m² */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <SectionDivider>Horas por m² (base de cálculo)</SectionDivider>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--ink3)" }}>
            Média de horas de projeto por metro quadrado conforme o tipo. Ajuste conforme sua experiência.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Residencial (h/m²)">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="1.5" value={horasM2Res}
                  onChange={(e) => setHorasM2Res(e.target.value)} />
                <span className="text-[12px] flex-shrink-0" style={{ color: "var(--ink3)" }}>h/m²</span>
              </div>
            </FormGroup>
            <FormGroup label="Comercial (h/m²)">
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="1.2" value={horasM2Com}
                  onChange={(e) => setHorasM2Com(e.target.value)} />
                <span className="text-[12px] flex-shrink-0" style={{ color: "var(--ink3)" }}>h/m²</span>
              </div>
            </FormGroup>
          </div>
        </div>

        {/* Etapas */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <div className="flex items-center justify-between mb-2">
            <SectionDivider>Etapas do seu processo</SectionDivider>
            <button
              type="button"
              onClick={resetEtapas}
              className="text-[11px]"
              style={{ background: "none", border: "none", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Restaurar padrão
            </button>
          </div>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--ink3)" }}>
            Estas são as etapas do seu processo. Edite os nomes e horas conforme sua dinâmica.
            Estas configurações valem para todos os projetos futuros.
          </p>
          <EtapasEditor etapas={etapas} onChange={setEtapas} />
        </div>

        {/* Identidade visual */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <SectionDivider>Identidade visual</SectionDivider>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--ink3)" }}>
            A logo aparece nos documentos gerados (PDF). Tamanho máximo recomendado: 120px de largura.
          </p>

          {/* Upload area */}
          <div className="flex gap-5 items-start mb-4">
            <div className="flex-1">
              <button type="button" onClick={() => logoInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:opacity-80"
                style={{ border: "0.5px dashed var(--border-strong)", background: "var(--surface2)", cursor: "pointer", height: 96, fontFamily: "'DM Sans', sans-serif" }}>
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo preview" style={{ maxWidth: 120, maxHeight: 52, objectFit: "contain" }} />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" style={{ color: "var(--ink3)" }}>
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 10l-4-4-4 4M12 6v8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px]" style={{ color: "var(--ink3)" }}>PNG, JPG ou SVG — até 1MB</span>
                  </>
                )}
              </button>
              <input ref={logoInputRef} type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleLogoChange} />
              {logoError && <p className="text-[11px] mt-1.5" style={{ color: "#DC2626" }}>{logoError}</p>}
            </div>

            {/* Preview box */}
            {logoBase64 && (
              <div className="flex flex-col gap-2">
                <div className="rounded-xl p-3 flex items-center justify-center"
                  style={{ border: "0.5px solid var(--border)", background: "#fff", width: 140, height: 96 }}>
                  <img src={logoBase64} alt="Preview" style={{ maxWidth: 120, maxHeight: 70, objectFit: "contain" }} />
                </div>
                <button type="button" onClick={() => setLogoBase64(undefined)}
                  className="text-[11px] text-center transition-opacity hover:opacity-70"
                  style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Remover logo
                </button>
              </div>
            )}
          </div>

          {/* Posição */}
          <div>
            <p className="text-[12px] font-medium mb-2" style={{ color: "var(--ink2)" }}>Posição no documento</p>
            <div className="flex flex-col gap-2">
              {[
                { id: "cabecalho" as LogoPosicao, label: "Cabeçalho", desc: "Canto superior de cada página, discreto (padrão)" },
                { id: "marca-dagua" as LogoPosicao, label: "Marca d'água", desc: "Centralizada atrás do texto, opacidade 8%" },
              ].map((opt) => (
                <label key={opt.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-colors"
                  style={{ border: `0.5px solid ${logoPosicao === opt.id ? "var(--accent)" : "var(--border)"}`, background: logoPosicao === opt.id ? "var(--accent-light)" : "var(--surface2)" }}>
                  <input type="radio" name="logoPosicao" value={opt.id} checked={logoPosicao === opt.id}
                    onChange={() => setLogoPosicao(opt.id)}
                    style={{ accentColor: "var(--accent)", marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: logoPosicao === opt.id ? "var(--accent)" : "var(--ink)" }}>{opt.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tema do documento */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <SectionDivider>Tema do documento</SectionDivider>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--ink3)" }}>
            Escolha a aparência visual dos PDFs gerados — proposta e briefing.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {PDF_THEMES.map((tema) => (
              <TemaCard key={tema.id} tema={tema}
                selected={temaDocumento === tema.id}
                onSelect={() => setTemaDocumento(tema.id)}
                onPreview={() => setTemaPreview(tema.id)} />
            ))}
          </div>
          {temaPreview && <TemaPreviewModal temaId={temaPreview} onClose={() => setTemaPreview(null)} />}
        </div>

        {/* Modelos do escritório */}
        <div className="rounded-2xl px-5 py-4" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
          <SectionDivider>Modelos do escritório</SectionDivider>
          <p className="text-[12px] mb-5 leading-relaxed" style={{ color: "var(--ink3)" }}>
            Cole ou faça upload de um documento anterior. A IA usará como referência de estrutura e tom nas próximas gerações.
          </p>
          <div className="flex flex-col gap-6">
            <ModeloEditor tipo="proposta" label="Modelo de Proposta" />
            <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
            <ModeloEditor tipo="briefing" label="Modelo de Briefing" />
          </div>
        </div>

        {/* Salvar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-[13px] font-medium text-white px-5 py-2.5 rounded-xl"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Salvar configurações
          </button>
          {saved && (
            <span className="text-[12px] flex items-center gap-1.5" style={{ color: "#2D5A3D" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Salvo com sucesso
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
