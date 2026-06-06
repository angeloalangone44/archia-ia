"use client";

import { useEffect, useState } from "react";
import {
  getConfiguracoesOrDefault,
  saveConfiguracoes,
  ETAPAS_PADRAO,
  type EtapaConfig,
} from "@/lib/configuracoes";
import { Input, FormGroup, SectionDivider } from "@/components/DocumentForm";

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

  useEffect(() => {
    const c = getConfiguracoesOrDefault();
    setValorHora   (String(c.valorHora    || ""));
    setHorasMensais(String(c.horasMensais || ""));
    setMargemLucro (String(c.margemLucro  || ""));
    setCustosFixos (String(c.custosFixos  || ""));
    setHorasM2Res  (String(c.horasM2Residencial ?? 1.5));
    setHorasM2Com  (String(c.horasM2Comercial   ?? 1.2));
    setEtapas      (c.etapas.length > 0 ? c.etapas : ETAPAS_PADRAO);
  }, []);

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
