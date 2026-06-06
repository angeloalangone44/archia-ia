"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  COMPLEXIDADE,
  PRAZO,
  calcular,
  saveCalculo,
  getCalculoByProjeto,
  formatCurrency,
  totalCustoVariavel,
  type CalculoInput,
  type Complexidade,
  type PrazoAjuste,
  type CustoVariavel,
  type CustoVariavelTipo,
  type EtapaCalculo,
  type CalculoResult,
} from "@/lib/calculadora";
import {
  getConfiguracoes,
  getConfiguracoesOrDefault,
  hasConfiguracoes,
  type ConfiguracaoEscritorio,
} from "@/lib/configuracoes";
import { getArchiaProjects, type ArchiaProjetoUnificado } from "@/lib/archia-project";

/* ── helpers ────────────────────────────────────────────── */

function mapBriefingTipo(t: string): "residencial" | "comercial" | "" {
  if (t.startsWith("residencial") || t === "reforma" || t === "interiores") return "residencial";
  if (t === "comercial") return "comercial";
  return "";
}

function etapasFromConfig(config: ConfiguracaoEscritorio): EtapaCalculo[] {
  return config.etapas.map((e) => ({
    id: e.id,
    nome: e.nome,
    horas: e.horas,
    selecionada: false,
  }));
}

/* ── banner sem config ──────────────────────────────────── */

function BannerSemConfig() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
        style={{ background: "var(--surface2)" }}>🧮</div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
        Configure o valor da sua hora primeiro
      </p>
      <p className="text-xs mb-6 max-w-xs" style={{ color: "var(--ink3)" }}>
        Para usar a calculadora, informe o valor da sua hora e margem de lucro desejada.
      </p>
      <Link href="/app/configuracoes"
        className="text-[13px] font-medium text-white px-5 py-2.5 rounded-xl"
        style={{ background: "var(--accent)", textDecoration: "none" }}>
        Configurar agora
      </Link>
    </div>
  );
}

/* ── project selector ───────────────────────────────────── */

function ProjectSelector({ projetoId, onChange }: { projetoId: string; onChange: (id: string) => void }) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  useEffect(() => { setProjetos(getArchiaProjects()); }, []);
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
        className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ink3)" }}>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Projeto:</span>
      <select value={projetoId} onChange={(e) => onChange(e.target.value)}
        className="text-[13px] flex-1"
        style={{ background: "transparent", border: "none", outline: "none",
          color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <option value="">Cálculo avulso</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
        ))}
      </select>
    </div>
  );
}

/* ── seção label ────────────────────────────────────────── */

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--ink3)" }}>
        {children}
      </p>
      {hint && <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>{hint}</p>}
    </div>
  );
}

/* ── editor de custos variáveis ─────────────────────────── */

function CustosVariaveisEditor({
  custos, onChange,
}: {
  custos: CustoVariavel[];
  onChange: (c: CustoVariavel[]) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  function add(tipo: CustoVariavelTipo) {
    const base: CustoVariavel = {
      id: crypto.randomUUID(), tipo,
      descricao: tipo === "renders" ? "Renders" : tipo === "visitas" ? "Visitas à obra" : "",
      qtdImagens: tipo === "renders" ? 1 : undefined,
      valorPorImagem: tipo === "renders" ? 0 : undefined,
      qtdVisitas: tipo === "visitas" ? 1 : undefined,
      valorPorVisita: tipo === "visitas" ? 0 : undefined,
      valor: tipo === "outro" ? 0 : undefined,
    };
    onChange([...custos, base]);
    setShowMenu(false);
  }

  function update(id: string, patch: Partial<CustoVariavel>) {
    onChange(custos.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    onChange(custos.filter((c) => c.id !== id));
  }

  return (
    <div>
      {custos.length > 0 && (
        <div className="flex flex-col gap-3 mb-3">
          {custos.map((c) => (
            <div key={c.id} className="rounded-xl px-4 py-3"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={c.descricao}
                  onChange={(e) => update(c.id, { descricao: e.target.value })}
                  className="text-[13px] font-medium bg-transparent flex-1"
                  style={{ border: "none", outline: "none", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}
                />
                <button onClick={() => remove(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {c.tipo === "renders" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "var(--ink3)" }}>Qtd:</span>
                    <input type="number" value={c.qtdImagens ?? ""} min={0}
                      onChange={(e) => update(c.id, { qtdImagens: parseFloat(e.target.value) || 0 })}
                      className="text-[12px] text-center rounded-lg"
                      style={{ width: 52, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)", padding: "5px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "var(--ink3)" }}>R$/imagem:</span>
                    <input type="number" value={c.valorPorImagem ?? ""} min={0}
                      onChange={(e) => update(c.id, { valorPorImagem: parseFloat(e.target.value) || 0 })}
                      className="text-[12px] text-center rounded-lg"
                      style={{ width: 72, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)", padding: "5px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                  </div>
                  <span className="text-[12px] font-medium ml-auto" style={{ color: "var(--ink)" }}>
                    = {formatCurrency(totalCustoVariavel(c))}
                  </span>
                </div>
              )}

              {c.tipo === "visitas" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "var(--ink3)" }}>Visitas:</span>
                    <input type="number" value={c.qtdVisitas ?? ""} min={0}
                      onChange={(e) => update(c.id, { qtdVisitas: parseFloat(e.target.value) || 0 })}
                      className="text-[12px] text-center rounded-lg"
                      style={{ width: 52, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)", padding: "5px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "var(--ink3)" }}>R$/visita:</span>
                    <input type="number" value={c.valorPorVisita ?? ""} min={0}
                      onChange={(e) => update(c.id, { valorPorVisita: parseFloat(e.target.value) || 0 })}
                      className="text-[12px] text-center rounded-lg"
                      style={{ width: 72, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)", padding: "5px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                  </div>
                  <span className="text-[12px] font-medium ml-auto" style={{ color: "var(--ink)" }}>
                    = {formatCurrency(totalCustoVariavel(c))}
                  </span>
                </div>
              )}

              {c.tipo === "outro" && (
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: "var(--ink3)" }}>Valor (R$):</span>
                  <input type="number" value={c.valor ?? ""} min={0}
                    onChange={(e) => update(c.id, { valor: parseFloat(e.target.value) || 0 })}
                    className="text-[12px] rounded-lg flex-1"
                    style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)", padding: "5px 8px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                  <span className="text-[12px] font-medium" style={{ color: "var(--ink)" }}>
                    = {formatCurrency(totalCustoVariavel(c))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão + menu */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          className="text-[12px] flex items-center gap-1.5 px-3 py-2 rounded-lg"
          style={{
            background: "var(--surface2)", border: "0.5px solid var(--border-strong)",
            color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar custo variável
        </button>

        {showMenu && (
          <div
            style={{
              position: "absolute", top: "100%", left: 0, zIndex: 50,
              background: "var(--surface)", border: "0.5px solid var(--border-strong)",
              borderRadius: 10, marginTop: 4, minWidth: 180,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {([
              { tipo: "renders" as CustoVariavelTipo, label: "Renders" },
              { tipo: "visitas" as CustoVariavelTipo, label: "Visitas à obra" },
              { tipo: "outro"   as CustoVariavelTipo, label: "Outro" },
            ]).map((opt) => (
              <button
                key={opt.tipo}
                type="button"
                onClick={() => add(opt.tipo)}
                className="w-full text-left px-4 py-2.5 text-[13px] transition-colors"
                style={{
                  background: "none", border: "none", color: "var(--ink)",
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── painel resultado ───────────────────────────────────── */

function ResultPanel({
  result,
  input,
  config,
  projetoId,
  nomeCliente,
  onSalvar,
  onUsarNaProposta,
  salvoMsg,
}: {
  result: CalculoResult;
  input: CalculoInput;
  config: ConfiguracaoEscritorio;
  projetoId: string;
  nomeCliente: string;
  onSalvar: () => void;
  onUsarNaProposta: () => void;
  salvoMsg: boolean;
}) {
  return (
    <div className="rounded-2xl overflow-hidden sticky top-6" style={{ border: "0.5px solid var(--border)" }}>
      <div className="px-5 py-4" style={{ background: "var(--surface2)", borderBottom: "0.5px solid var(--border)" }}>
        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--ink3)" }}>
          Resultado em tempo real
        </p>
      </div>

      {/* Detalhamento */}
      <div className="px-5 py-4 space-y-2" style={{ background: "var(--surface)", borderBottom: "0.5px solid var(--border)" }}>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: "var(--ink3)" }}>
            Horas estimadas
            <span className="ml-1 text-[10px]" style={{ color: "var(--ink3)", opacity: 0.7 }}>
              ({result.horasBaseTipo.toFixed(0)}h tipo + {result.horasEtapas.toFixed(0)}h etapas) ÷ 2 × {COMPLEXIDADE[input.complexidade].mult}
            </span>
          </span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{result.horasFinal.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: "var(--ink3)" }}>Custo operacional</span>
          <span style={{ color: "var(--ink)" }}>{formatCurrency(result.custoBase)}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: "var(--ink3)" }}>Margem ({input.margemLucro}%)</span>
          <span style={{ color: "var(--ink)" }}>+ {formatCurrency(result.margemValor)}</span>
        </div>
        {result.ajustePrazoValor > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Ajuste de prazo</span>
            <span style={{ color: "#C06000" }}>+ {formatCurrency(result.ajustePrazoValor)}</span>
          </div>
        )}
        {result.descontoVisibilidadeValor > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Desconto visibilidade</span>
            <span style={{ color: "#2D5A3D" }}>- {formatCurrency(result.descontoVisibilidadeValor)}</span>
          </div>
        )}
        {result.custosVariaveisTotal > 0 && (
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "var(--ink3)" }}>Custos variáveis</span>
            <span style={{ color: "var(--ink)" }}>+ {formatCurrency(result.custosVariaveisTotal)}</span>
          </div>
        )}
        {input.custosVariaveis.filter((c) => totalCustoVariavel(c) > 0).map((c) => (
          <div key={c.id} className="flex justify-between text-[11px] pl-3">
            <span style={{ color: "var(--ink3)" }}>↳ {c.descricao || c.tipo}</span>
            <span style={{ color: "var(--ink3)" }}>{formatCurrency(totalCustoVariavel(c))}</span>
          </div>
        ))}
      </div>

      {/* Resultado em destaque */}
      <div className="px-5 py-5" style={{ background: "var(--surface)" }}>
        <p className="text-[11px] font-medium uppercase tracking-widest mb-4" style={{ color: "var(--ink3)" }}>
          Honorário recomendado
        </p>

        <div className="flex justify-between items-baseline mb-2.5 py-2 px-3 rounded-lg"
          style={{ background: "var(--surface2)" }}>
          <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Mínimo</span>
          <span className="text-[14px] font-medium" style={{ color: "var(--ink2)" }}>
            {formatCurrency(result.totalMinimo)}
          </span>
        </div>

        <div className="flex justify-between items-baseline mb-2.5 py-3 px-3 rounded-xl"
          style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}>
          <div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>Ideal</span>
          </div>
          <span className="text-[18px] font-bold" style={{ color: "var(--accent)" }}>
            {formatCurrency(result.totalFinal)}
          </span>
        </div>

        <div className="flex justify-between items-baseline py-2 px-3 rounded-lg"
          style={{ background: "var(--surface2)" }}>
          <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Premium (+25%)</span>
          <span className="text-[14px] font-medium" style={{ color: "var(--ink2)" }}>
            {formatCurrency(result.totalPremium)}
          </span>
        </div>

        <p className="text-[11px] mt-3 text-center leading-relaxed" style={{ color: "var(--ink3)" }}>
          Baseado em {result.horasFinal.toFixed(0)}h estimadas · {formatCurrency(config.valorHora)}/h
          · Margem {input.margemLucro}%
          {result.custosVariaveisTotal > 0 && ` · Variáveis ${formatCurrency(result.custosVariaveisTotal)}`}
        </p>

        <div className="flex flex-col gap-2 mt-4">
          <button onClick={onUsarNaProposta}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-white rounded-xl py-2.5"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Usar valor ideal na proposta
          </button>
          <button onClick={onSalvar}
            className="w-full text-[12px] py-2 rounded-xl"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            {salvoMsg ? "✓ Salvo!" : "Salvar cálculo"}
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
  const [config, setConfig] = useState<ConfiguracaoEscritorio>(getConfiguracoesOrDefault());
  const [projetoId, setProjetoId] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [salvoMsg, setSalvoMsg] = useState(false);
  const calculoIdRef = useRef(crypto.randomUUID());

  const [input, setInput] = useState<CalculoInput>({
    tipo: "",
    metragem: "",
    complexidade: "branca",
    etapas: [],
    prazo: "normal",
    visibilidade: false,
    descontoVisibilidade: 0,
    margemLucro: 0,
    custosVariaveis: [],
  });

  useEffect(() => {
    const ok = hasConfiguracoes();
    setConfigOk(ok);
    const c = getConfiguracoesOrDefault();
    setConfig(c);
    setInput((prev) => ({
      ...prev,
      margemLucro: c.margemLucro,
      etapas: etapasFromConfig(c),
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("projeto");
    if (id) setTimeout(() => handleSelectProject(id), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configOk]);

  function handleSelectProject(id: string) {
    setProjetoId(id);
    if (!id) { setNomeCliente(""); return; }

    const p = getArchiaProjects().find((x) => x.id === id);
    if (!p) return;
    setNomeCliente(p.cliente.nome);

    const tipo = mapBriefingTipo(p.projeto.tipo);
    const metragem = p.projeto.area.replace(/[^\d.,]/g, "").replace(",", ".") || "";

    setInput((prev) => ({
      ...prev,
      tipo,
      metragem,
    }));

    // carrega cálculo salvo se existir
    const saved = getCalculoByProjeto(id);
    if (saved) {
      setInput(saved.input);
      calculoIdRef.current = saved.id;
    }
  }

  function set<K extends keyof CalculoInput>(k: K, v: CalculoInput[K]) {
    setInput((prev) => ({ ...prev, [k]: v }));
  }

  function toggleEtapa(id: string) {
    setInput((prev) => ({
      ...prev,
      etapas: prev.etapas.map((e) =>
        e.id === id ? { ...e, selecionada: !e.selecionada } : e
      ),
    }));
  }

  function updateHoras(id: string, horas: number) {
    setInput((prev) => ({
      ...prev,
      etapas: prev.etapas.map((e) => e.id === id ? { ...e, horas } : e),
    }));
  }

  const result = (configOk && input.tipo && input.metragem)
    ? calcular(input, config)
    : null;

  function handleSalvar() {
    if (!result) return;
    saveCalculo({
      id: calculoIdRef.current,
      projetoId,
      nomeCliente,
      data: new Date().toISOString(),
      input,
      result,
    });
    setSalvoMsg(true);
    setTimeout(() => setSalvoMsg(false), 2500);
  }

  function handleUsarNaProposta() {
    if (!result) return;
    localStorage.setItem("archia_honorario_sugerido", JSON.stringify({
      valor: formatCurrency(result.totalFinal),
      projetoId,
      nomeCliente,
    }));
    handleSalvar();
    router.push(projetoId ? `/app/proposta?projeto=${projetoId}` : "/app/proposta");
  }

  if (configOk === null) return null;
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
            {formatCurrency(config.valorHora)}/hora · Margem padrão {config.margemLucro}%
          </p>
        </div>
        <Link href="/app/configuracoes"
          className="text-[11px] flex items-center gap-1"
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

        {/* ── Coluna esquerda ─────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Tipo e metragem */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <SectionTitle>Tipo e metragem</SectionTitle>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {([
                { id: "residencial", label: "Residencial", desc: `${config.horasM2Residencial}h/m²` },
                { id: "comercial",   label: "Comercial",   desc: `${config.horasM2Comercial}h/m²` },
              ] as const).map(({ id, label, desc }) => (
                <button key={id} type="button" onClick={() => set("tipo", id)}
                  className="text-left px-4 py-3 rounded-xl transition-all"
                  style={{
                    border: input.tipo === id ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                    background: input.tipo === id ? "var(--accent-light)" : "var(--surface2)",
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  }}>
                  <p className="text-[13px] font-medium" style={{ color: input.tipo === id ? "var(--accent)" : "var(--ink)" }}>
                    {label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: input.tipo === id ? "var(--accent)" : "var(--ink3)", opacity: 0.8 }}>
                    {desc}
                  </p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--ink2)" }}>
                Metragem total (m²) *
              </label>
              <input
                type="number"
                placeholder="Ex: 80"
                value={input.metragem}
                onChange={(e) => set("metragem", e.target.value)}
                className="text-[13px] px-3 py-2 rounded-lg w-40"
                style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
              />
            </div>
          </div>

          {/* Complexidade */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <SectionTitle>Nível de complexidade</SectionTitle>
            <div className="flex flex-col gap-3">
              {(["branca", "cinza"] as Complexidade[]).map((c) => {
                const info = COMPLEXIDADE[c];
                const active = input.complexidade === c;
                return (
                  <button key={c} type="button" onClick={() => set("complexidade", c)}
                    className="text-left px-4 py-3 rounded-xl transition-all"
                    style={{
                      border: active ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                      background: active ? "var(--accent-light)" : "var(--surface2)",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: active ? "var(--accent)" : "var(--border-strong)" }}>
                        {active && <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: active ? "var(--accent)" : "var(--ink)" }}>
                        {info.label}
                        <span className="ml-2 text-[11px] font-normal opacity-70">×{info.mult}</span>
                      </p>
                    </div>
                    <p className="text-[11px] pl-6" style={{ color: active ? "var(--accent)" : "var(--ink3)", opacity: 0.85 }}>
                      {info.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Etapas */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <SectionTitle hint="Marque apenas as etapas incluídas neste contrato. As horas vêm das suas configurações mas podem ser ajustadas.">
              Etapas contratadas
            </SectionTitle>

            {input.etapas.length === 0 ? (
              <p className="text-[12px]" style={{ color: "var(--ink3)" }}>
                Nenhuma etapa configurada.{" "}
                <Link href="/app/configuracoes" style={{ color: "var(--accent)", textDecoration: "none" }}>
                  Configurar agora
                </Link>
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {input.etapas.map((etapa) => (
                  <div key={etapa.id} className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleEtapa(etapa.id)}
                      className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl text-left"
                      style={{
                        border: etapa.selecionada ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                        background: etapa.selecionada ? "var(--accent-light)" : "var(--surface2)",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: etapa.selecionada ? "var(--accent)" : "transparent", border: etapa.selecionada ? "none" : "1.5px solid var(--border-strong)" }}>
                        {etapa.selecionada && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px]"
                        style={{ color: etapa.selecionada ? "var(--accent)" : "var(--ink2)", fontWeight: etapa.selecionada ? 500 : 400 }}>
                        {etapa.nome}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input type="number" value={etapa.horas}
                        onChange={(e) => updateHoras(etapa.id, parseFloat(e.target.value) || 0)}
                        className="text-[13px] text-center rounded-lg"
                        style={{ width: 52, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", padding: "6px 4px", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                      <span className="text-[11px]" style={{ color: "var(--ink3)" }}>h</span>
                    </div>
                  </div>
                ))}
                {input.etapas.some((e) => e.selecionada) && (
                  <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                    {input.etapas.filter((e) => e.selecionada).reduce((s, e) => s + e.horas, 0)}h de etapas selecionadas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Custos variáveis */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <SectionTitle>Custos variáveis</SectionTitle>
            <CustosVariaveisEditor
              custos={input.custosVariaveis}
              onChange={(c) => set("custosVariaveis", c)}
            />
          </div>

          {/* Fatores de ajuste */}
          <div className="rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <SectionTitle>Fatores de ajuste</SectionTitle>

            {/* Prazo */}
            <div className="mb-5">
              <p className="text-[12px] font-medium mb-2" style={{ color: "var(--ink2)" }}>Prazo</p>
              <div className="flex gap-2">
                {(Object.entries(PRAZO) as [PrazoAjuste, { label: string; mult: number }][]).map(([id, { label }]) => (
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
            <div className="mb-5">
              <div className="flex items-start gap-3 mb-2">
                <button type="button" onClick={() => set("visibilidade", !input.visibilidade)}
                  className="flex-shrink-0 mt-0.5"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
                <div className="flex items-center gap-3 pl-12">
                  <label className="text-[12px]" style={{ color: "var(--ink3)" }}>Desconto (%)</label>
                  <input type="number" placeholder="Ex: 15"
                    value={input.descontoVisibilidade || ""}
                    onChange={(e) => set("descontoVisibilidade", parseFloat(e.target.value) || 0)}
                    className="text-[13px] px-3 py-2 rounded-lg"
                    style={{ width: 80, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                </div>
              )}
            </div>

            {/* Margem */}
            <div>
              <p className="text-[12px] font-medium mb-1" style={{ color: "var(--ink2)" }}>Margem de lucro deste projeto (%)</p>
              <p className="text-[11px] mb-2" style={{ color: "var(--ink3)" }}>
                Ajuste conforme seu interesse neste projeto específico
              </p>
              <div className="flex items-center gap-3">
                <input type="number" value={input.margemLucro || ""}
                  onChange={(e) => set("margemLucro", parseFloat(e.target.value) || 0)}
                  className="text-[13px] px-3 py-2 rounded-lg"
                  style={{ width: 80, border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                {input.margemLucro !== config.margemLucro && (
                  <button type="button" onClick={() => set("margemLucro", config.margemLucro)}
                    className="text-[11px]"
                    style={{ background: "none", border: "none", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    Restaurar padrão ({config.margemLucro}%)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Painel resultado ────────────────────────── */}
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
              salvoMsg={salvoMsg}
            />
          ) : (
            <div className="rounded-2xl px-5 py-8 text-center sticky top-6"
              style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
              <div className="text-3xl mb-3">🧮</div>
              <p className="text-[13px] font-medium mb-1" style={{ color: "var(--ink)" }}>
                Preencha tipo e metragem
              </p>
              <p className="text-[11px]" style={{ color: "var(--ink3)" }}>
                O resultado aparece em tempo real conforme você preenche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
