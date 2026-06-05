"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ETAPAS,
  TIPOS_PROJETO,
  BRIEFING_TIPO_MAP,
  COMPLEXIDADE_MULT,
  PRAZO_MULT,
  calcular,
  saveCalculo,
  getCalculoByProjeto,
  formatCurrency,
  type CalculoInput,
  type Complexidade,
  type PrazoAjuste,
} from "@/lib/calculadora";
import { getConfiguracoes, hasConfiguracoes } from "@/lib/configuracoes";
import { getArchiaProjects, type ArchiaProjetoUnificado } from "@/lib/archia-project";

/* ── helpers ────────────────────────────────────────────── */

function numBanheirosPorAmbientes(ambientes: string[]): string {
  const count = ambientes.filter((a) => a === "banheiro" || a === "lavabo").length;
  if (count === 0) return "1";
  if (count >= 5) return "5+";
  return String(count);
}

function defaultEtapas() {
  return Object.fromEntries(ETAPAS.map((e) => [e.id, e.horasDefault]));
}

/* ── banner "configure primeiro" ───────────────────────── */

function BannerSemConfig() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: "var(--surface2)" }}>
        🧮
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Configure o valor da sua hora primeiro</p>
      <p className="text-xs mb-6 max-w-xs" style={{ color: "var(--ink3)" }}>
        Para usar a calculadora, informe o valor da sua hora e sua margem de lucro desejada.
      </p>
      <Link
        href="/app/configuracoes"
        className="text-[13px] font-medium text-white px-5 py-2.5 rounded-xl"
        style={{ background: "var(--accent)", textDecoration: "none" }}
      >
        Configurar agora
      </Link>
    </div>
  );
}

/* ── seletor de projeto ─────────────────────────────────── */

function ProjectSelector({
  projetoId, onChange,
}: { projetoId: string; onChange: (id: string) => void }) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  useEffect(() => { setProjetos(getArchiaProjects()); }, []);

  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ink3)" }}>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Projeto:</span>
      <select value={projetoId} onChange={(e) => onChange(e.target.value)}
        className="text-[13px] flex-1"
        style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <option value="">Cálculo avulso (sem projeto)</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
        ))}
      </select>
    </div>
  );
}

/* ── label de campo ─────────────────────────────────────── */

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-[12px] font-medium" style={{ color: "var(--ink2)" }}>{children}</p>
      {hint && <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>{hint}</p>}
    </div>
  );
}

/* ── painel de resultado ────────────────────────────────── */

function ResultPanel({
  result, input, config, projetoId, nomeCliente, onSalvar, onUsarNaProposta,
}: {
  result: NonNullable<ReturnType<typeof calcular>>;
  input: CalculoInput;
  config: { valorHora: number; horasMensais: number; margemLucro: number; custosFixos: number };
  projetoId: string;
  nomeCliente: string;
  onSalvar: () => void;
  onUsarNaProposta: () => void;
}) {
  const horas = result.horasEstimadas;

  return (
    <div className="rounded-2xl overflow-hidden sticky top-6" style={{ border: "0.5px solid var(--border)" }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--ink3)" }}>
          Resultado do cálculo
        </p>
      </div>

      {/* Detalhes */}
      <div className="px-5 py-4 space-y-2.5" style={{ background: "var(--surface)", borderBottom: "0.5px solid var(--border)" }}>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: "var(--ink3)" }}>Horas estimadas</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{horas.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: "var(--ink3)" }}>Custo de mão de obra</span>
          <span style={{ color: "var(--ink)" }}>{formatCurrency(result.custoHora)}</span>
        </div>
        {result.custoFixoProporcional > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Custos fixos proporcionais</span>
            <span style={{ color: "var(--ink)" }}>{formatCurrency(result.custoFixoProporcional)}</span>
          </div>
        )}
        <div className="flex justify-between text-[12px]" style={{ paddingTop: 6, borderTop: "0.5px solid var(--border)" }}>
          <span style={{ color: "var(--ink2)", fontWeight: 500 }}>Custo total</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{formatCurrency(result.custoTotal)}</span>
        </div>
        {result.ajustePrazoValor > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Ajuste de prazo urgente</span>
            <span style={{ color: "#C06000" }}>+{formatCurrency(result.ajustePrazoValor)}</span>
          </div>
        )}
        {result.descontoVisibilidadeValor > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Desconto de visibilidade</span>
            <span style={{ color: "#2D5A3D" }}>-{formatCurrency(result.descontoVisibilidadeValor)}</span>
          </div>
        )}
      </div>

      {/* Resultado em destaque */}
      <div className="px-5 py-5" style={{ background: "var(--surface)" }}>
        <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: "var(--ink3)" }}>
          Honorário recomendado
        </p>

        {/* Mínimo */}
        <div className="flex justify-between items-baseline mb-2.5 py-2 px-3 rounded-lg"
          style={{ background: "var(--surface2)" }}>
          <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Mínimo (sem margem)</span>
          <span className="text-[14px] font-medium" style={{ color: "var(--ink2)" }}>
            {formatCurrency(result.honorarioMinimo)}
          </span>
        </div>

        {/* Ideal — destaque */}
        <div className="flex justify-between items-baseline mb-2.5 py-3 px-3 rounded-xl"
          style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}>
          <div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>Ideal</span>
            <span className="text-[10px] ml-1.5" style={{ color: "var(--accent)", opacity: 0.7 }}>
              margem {input.margemLucro}%
            </span>
          </div>
          <span className="text-[18px] font-bold" style={{ color: "var(--accent)" }}>
            {formatCurrency(result.honorarioIdeal)}
          </span>
        </div>

        {/* Premium */}
        <div className="flex justify-between items-baseline py-2 px-3 rounded-lg"
          style={{ background: "var(--surface2)" }}>
          <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Premium (+25%)</span>
          <span className="text-[14px] font-medium" style={{ color: "var(--ink2)" }}>
            {formatCurrency(result.honorarioPremium)}
          </span>
        </div>

        {/* Rodapé de contexto */}
        <p className="text-[11px] mt-3 text-center" style={{ color: "var(--ink3)" }}>
          Baseado em {horas.toFixed(0)}h estimadas · {formatCurrency(config.valorHora)}/h · margem {input.margemLucro}%
        </p>

        {/* Ações */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onUsarNaProposta}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-white rounded-xl py-2.5"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Usar na proposta
          </button>
          <button
            onClick={onSalvar}
            className="w-full text-[12px] py-2 rounded-xl"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Salvar cálculo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── página principal ───────────────────────────────────── */

export default function CalculadoraPage() {
  const router = useRouter();
  const [configOk, setConfigOk] = useState<boolean | null>(null);
  const [config, setConfig] = useState({ valorHora: 0, horasMensais: 0, margemLucro: 0, custosFixos: 0 });
  const [projetoId, setProjetoId] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [salvoMsg, setSalvoMsg] = useState(false);
  const calculoIdRef = useRef(crypto.randomUUID());

  const [input, setInput] = useState<CalculoInput>({
    tipoProjeto:          "",
    metragem:             "",
    numBanheiros:         "1",
    complexidade:         "media",
    etapas:               defaultEtapas(),
    etapasSelecionadas:   [],
    prazo:                "normal",
    visibilidade:         false,
    descontoVisibilidade: 0,
    margemLucro:          0,
  });

  /* carrega config do escritório */
  useEffect(() => {
    const ok = hasConfiguracoes();
    setConfigOk(ok);
    if (ok) {
      const c = getConfiguracoes()!;
      setConfig(c);
      setInput((prev) => ({ ...prev, margemLucro: c.margemLucro }));
    }
  }, []);

  /* URL param: ?projeto=ID */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("projeto");
    if (id) handleSelectProject(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectProject(id: string) {
    setProjetoId(id);
    if (!id) { setNomeCliente(""); return; }

    const projetos = getArchiaProjects();
    const p = projetos.find((x) => x.id === id);
    if (!p) return;

    setNomeCliente(p.cliente.nome);

    // pré-preenche tipo
    const tipo = BRIEFING_TIPO_MAP[p.projeto.tipo] ?? "";
    // pré-preenche metragem
    const metragem = p.projeto.area.replace(/[^\d.,]/g, "").replace(",", ".") || "";
    // número de banheiros a partir dos ambientes
    const banheiros = numBanheirosPorAmbientes(p.ambientesOrdem);

    setInput((prev) => ({
      ...prev,
      tipoProjeto:  tipo,
      metragem,
      numBanheiros: banheiros,
    }));

    // carrega cálculo salvo se existir
    const saved = getCalculoByProjeto(id);
    if (saved) {
      setInput(saved.input);
      calculoIdRef.current = saved.id;
    }
  }

  const set = <K extends keyof CalculoInput>(k: K, v: CalculoInput[K]) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  function toggleEtapa(id: string) {
    setInput((prev) => {
      const sel = prev.etapasSelecionadas;
      return {
        ...prev,
        etapasSelecionadas: sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id],
      };
    });
  }

  function updateHoras(id: string, h: number) {
    setInput((prev) => ({ ...prev, etapas: { ...prev.etapas, [id]: h } }));
  }

  const result = configOk ? calcular(input, config) : null;

  function handleSalvar() {
    if (!result) return;
    saveCalculo({
      id: calculoIdRef.current,
      projetoId,
      nomeCliente,
      data: new Date().toISOString(),
      input,
      result,
      honorarioFinal: result.honorarioIdeal,
    });
    setSalvoMsg(true);
    setTimeout(() => setSalvoMsg(false), 2500);
  }

  function handleUsarNaProposta() {
    if (!result) return;
    // Salva o valor no localStorage para a proposta pegar
    localStorage.setItem("archia_honorario_sugerido", JSON.stringify({
      valor:  formatCurrency(result.honorarioIdeal).replace("R$ ", "R$ "),
      projetoId,
      nomeCliente,
    }));
    handleSalvar();
    router.push(projetoId ? `/app/proposta?projeto=${projetoId}` : "/app/proposta");
  }

  /* Botões de tipo (rádio visual) */
  const btnTipo = (id: string) => (
    <button
      key={id}
      type="button"
      onClick={() => set("tipoProjeto", id)}
      className="text-left px-3 py-2.5 rounded-xl text-[12px] transition-all"
      style={{
        border: input.tipoProjeto === id ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
        background: input.tipoProjeto === id ? "var(--accent-light)" : "var(--surface)",
        color: input.tipoProjeto === id ? "var(--accent)" : "var(--ink2)",
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: input.tipoProjeto === id ? 500 : 400,
      }}
    >
      {TIPOS_PROJETO.find((t) => t.id === id)?.label}
      <span className="ml-1 text-[10px] opacity-60">×{TIPOS_PROJETO.find((t) => t.id === id)?.peso.toFixed(1)}</span>
    </button>
  );

  if (configOk === null) return null; // loading

  if (!configOk) return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Calculadora de Precificação</h1>
      </div>
      <BannerSemConfig />
    </div>
  );

  return (
    <div className="p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Calculadora de Precificação</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Hora: {formatCurrency(config.valorHora)} · Margem padrão: {config.margemLucro}%
          </p>
        </div>
        <Link href="/app/configuracoes" className="text-[11px] flex items-center gap-1"
          style={{ color: "var(--ink3)", textDecoration: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurações
        </Link>
      </div>

      <ProjectSelector projetoId={projetoId} onChange={handleSelectProject} />

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>

        {/* ── Coluna de inputs ────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Tipo e escopo */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: "var(--ink3)" }}>
              Tipo e escopo
            </p>

            <div className="mb-4">
              <FieldLabel>Tipo de projeto</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_PROJETO.map((t) => btnTipo(t.id))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <FieldLabel hint="Metragem total do projeto">Metragem (m²)</FieldLabel>
                <input
                  type="number"
                  placeholder="Ex: 80"
                  value={input.metragem}
                  onChange={(e) => set("metragem", e.target.value)}
                  className="w-full text-[13px] px-3 py-2 rounded-lg"
                  style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                />
              </div>

              <div>
                <FieldLabel hint="Banheiros aumentam o tempo de projeto">Nº de banheiros</FieldLabel>
                <div className="flex gap-1.5 flex-wrap">
                  {["1", "2", "3", "4", "5+"].map((n) => (
                    <button key={n} type="button" onClick={() => set("numBanheiros", n)}
                      className="text-[12px] px-2.5 py-1.5 rounded-lg"
                      style={{
                        border: input.numBanheiros === n ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                        background: input.numBanheiros === n ? "var(--accent-light)" : "var(--surface2)",
                        color: input.numBanheiros === n ? "var(--accent)" : "var(--ink2)",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: input.numBanheiros === n ? 600 : 400,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel hint="Cliente indeciso ou projeto conceitual = alta">Complexidade</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  {(["baixa", "media", "alta"] as Complexidade[]).map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer text-[12px]"
                      style={{ color: input.complexidade === c ? "var(--ink)" : "var(--ink3)", fontFamily: "'DM Sans', sans-serif" }}>
                      <input type="radio" name="complexidade" value={c} checked={input.complexidade === c}
                        onChange={() => set("complexidade", c)}
                        style={{ accentColor: "var(--accent)" }} />
                      {c === "baixa" ? "Baixa ×0.9" : c === "media" ? "Média ×1.0" : "Alta ×1.25"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Etapas */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: "var(--ink3)" }}>
              Etapas contratadas
            </p>
            <p className="text-[11px] mb-4" style={{ color: "var(--ink3)" }}>
              Marque apenas as etapas deste contrato. As horas são estimativas — ajuste conforme sua experiência.
            </p>
            <div className="flex flex-col gap-2">
              {ETAPAS.map((etapa) => {
                const sel = input.etapasSelecionadas.includes(etapa.id);
                return (
                  <div key={etapa.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleEtapa(etapa.id)}
                      className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl text-left"
                      style={{
                        border: sel ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                        background: sel ? "var(--accent-light)" : "var(--surface2)",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      }}
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: sel ? "var(--accent)" : "transparent", border: sel ? "none" : "1.5px solid var(--border-strong)" }}>
                        {sel && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>}
                      </div>
                      <span className="text-[13px]" style={{ color: sel ? "var(--accent)" : "var(--ink2)", fontWeight: sel ? 500 : 400 }}>
                        {etapa.label}
                      </span>
                    </button>
                    {/* campo de horas editável */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <input
                        type="number"
                        value={input.etapas[etapa.id] ?? etapa.horasDefault}
                        onChange={(e) => updateHoras(etapa.id, parseFloat(e.target.value) || 0)}
                        className="text-[13px] text-center rounded-lg"
                        style={{
                          width: 52, border: "0.5px solid var(--border-strong)", background: "var(--surface2)",
                          color: "var(--ink)", padding: "6px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none",
                        }}
                      />
                      <span className="text-[11px]" style={{ color: "var(--ink3)" }}>h</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {input.etapasSelecionadas.length > 0 && (
              <p className="text-[11px] mt-3" style={{ color: "var(--ink3)" }}>
                Total: {input.etapasSelecionadas.reduce((s, id) => s + (input.etapas[id] ?? 0), 0)}h base
                {" "}(antes dos multiplicadores de tipo e complexidade)
              </p>
            )}
          </div>

          {/* Fatores de ajuste */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: "var(--ink3)" }}>
              Fatores de ajuste
            </p>

            {/* Prazo */}
            <div className="mb-4">
              <FieldLabel>Prazo</FieldLabel>
              <div className="flex gap-2">
                {([
                  { id: "normal", label: "Normal" },
                  { id: "urgente", label: "Urgente +20%" },
                  { id: "muito_urgente", label: "Muito urgente +35%" },
                ] as { id: PrazoAjuste; label: string }[]).map(({ id, label }) => (
                  <button key={id} type="button" onClick={() => set("prazo", id)}
                    className="text-[12px] px-3 py-2 rounded-xl flex-1"
                    style={{
                      border: input.prazo === id ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                      background: input.prazo === id ? "var(--accent-light)" : "var(--surface2)",
                      color: input.prazo === id ? "var(--accent)" : "var(--ink2)",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: input.prazo === id ? 500 : 400,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibilidade */}
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => set("visibilidade", !input.visibilidade)}
                  className="flex-shrink-0 mt-0.5"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: input.visibilidade ? "var(--accent)" : "var(--border-strong)" }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform"
                      style={{ transform: input.visibilidade ? "translateX(18px)" : "translateX(2px)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </button>
                <div>
                  <p className="text-[13px]" style={{ color: "var(--ink)" }}>
                    Este projeto vale mais pela exposição do que pelo lucro
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>
                    Ativa desconto de visibilidade no valor final
                  </p>
                </div>
              </div>
              {input.visibilidade && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-[12px]" style={{ color: "var(--ink3)" }}>Desconto de visibilidade (%)</label>
                  <input
                    type="number"
                    placeholder="Ex: 15"
                    value={input.descontoVisibilidade || ""}
                    onChange={(e) => set("descontoVisibilidade", parseFloat(e.target.value) || 0)}
                    className="text-[13px] px-3 py-2 rounded-lg"
                    style={{ width: 80, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                  />
                </div>
              )}
            </div>

            {/* Margem do projeto */}
            <div>
              <FieldLabel hint="Ajuste conforme seu interesse neste projeto específico">
                Margem de lucro deste projeto (%)
              </FieldLabel>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={input.margemLucro || ""}
                  onChange={(e) => set("margemLucro", parseFloat(e.target.value) || 0)}
                  className="text-[13px] px-3 py-2 rounded-lg"
                  style={{ width: 80, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                />
                {input.margemLucro !== config.margemLucro && (
                  <button
                    type="button"
                    onClick={() => set("margemLucro", config.margemLucro)}
                    className="text-[11px]"
                    style={{ background: "none", border: "none", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Restaurar padrão ({config.margemLucro}%)
                  </button>
                )}
              </div>
            </div>
          </div>

          {salvoMsg && (
            <div className="text-[12px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
              style={{ background: "#EAF2EC", color: "#2D5A3D", border: "1px solid #A8D5B2" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Cálculo salvo com sucesso
            </div>
          )}
        </div>

        {/* ── Painel de resultado ─────────────────────────── */}
        <div>
          {result ? (
            <ResultPanel
              result={result}
              input={input}
              config={config}
              projetoId={projetoId}
              nomeCliente={nomeCliente}
              onSalvar={handleSalvar}
              onUsarNaProposta={handleUsarNaProposta}
            />
          ) : (
            <div className="rounded-2xl px-5 py-8 text-center sticky top-6"
              style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
              <div className="text-3xl mb-3">🧮</div>
              <p className="text-[13px] font-medium mb-1" style={{ color: "var(--ink)" }}>
                Preencha os campos
              </p>
              <p className="text-[11px]" style={{ color: "var(--ink3)" }}>
                O resultado aparece aqui em tempo real conforme você preenche o tipo de projeto e seleciona as etapas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
