/* ── Etapas ─────────────────────────────────────────────── */

export type EtapaCalculo = {
  id: string;
  label: string;
  horasDefault: number;
};

export const ETAPAS: EtapaCalculo[] = [
  { id: "briefing",    label: "Levantamento e briefing",   horasDefault: 8  },
  { id: "preliminar",  label: "Estudo preliminar",         horasDefault: 16 },
  { id: "anteprojeto", label: "Anteprojeto / 3D",          horasDefault: 24 },
  { id: "executivo",   label: "Projeto executivo",         horasDefault: 40 },
  { id: "assessoria",  label: "Assessoria de obra",        horasDefault: 20 },
  { id: "compras",     label: "Gerenciamento de compras",  horasDefault: 16 },
];

/* ── Tipos de projeto ───────────────────────────────────── */

export type TipoProjeto = { id: string; label: string; peso: number };

export const TIPOS_PROJETO: TipoProjeto[] = [
  { id: "interiores",   label: "Interiores sem obra",           peso: 1.0 },
  { id: "reforma-parc", label: "Reforma parcial",               peso: 1.2 },
  { id: "reforma-comp", label: "Reforma completa",              peso: 1.4 },
  { id: "resid-apto",   label: "Residencial apartamento",       peso: 1.5 },
  { id: "resid-casa",   label: "Residencial casa",              peso: 1.3 },
  { id: "comercial",    label: "Comercial escritório / loja",   peso: 1.2 },
];

/* ── Mapeamento de tipo do briefing → tipo da calculadora ─ */
export const BRIEFING_TIPO_MAP: Record<string, string> = {
  "interiores":        "interiores",
  "reforma":           "reforma-parc",
  "residencial-apto":  "resid-apto",
  "residencial-casa":  "resid-casa",
  "comercial":         "comercial",
};

/* ── Complexidade ───────────────────────────────────────── */

export type Complexidade = "baixa" | "media" | "alta";

export const COMPLEXIDADE_MULT: Record<Complexidade, number> = {
  baixa: 0.9,
  media: 1.0,
  alta:  1.25,
};

/* ── Prazo ──────────────────────────────────────────────── */

export type PrazoAjuste = "normal" | "urgente" | "muito_urgente";

export const PRAZO_MULT: Record<PrazoAjuste, number> = {
  normal:        1.0,
  urgente:       1.2,
  muito_urgente: 1.35,
};

/* ── Input / Result ─────────────────────────────────────── */

export type CalculoInput = {
  tipoProjeto: string;
  metragem: string;
  numBanheiros: string;
  complexidade: Complexidade;
  etapas: Record<string, number>;       // id → horas (editável)
  etapasSelecionadas: string[];
  prazo: PrazoAjuste;
  visibilidade: boolean;
  descontoVisibilidade: number;
  margemLucro: number;
};

export type CalculoResult = {
  horasEstimadas: number;
  custoHora: number;
  custoFixoProporcional: number;
  custoTotal: number;
  honorarioMinimo: number;
  honorarioIdeal: number;
  honorarioPremium: number;
  ajustePrazoValor: number;
  descontoVisibilidadeValor: number;
};

export function calcular(
  input: CalculoInput,
  config: { valorHora: number; horasMensais: number; margemLucro: number; custosFixos: number }
): CalculoResult | null {
  if (!input.tipoProjeto || input.etapasSelecionadas.length === 0 || config.valorHora <= 0) {
    return null;
  }

  const tipo = TIPOS_PROJETO.find((t) => t.id === input.tipoProjeto);
  const multTipo        = tipo?.peso ?? 1.0;
  const multComplexidade = COMPLEXIDADE_MULT[input.complexidade] ?? 1.0;

  const horasBase = input.etapasSelecionadas.reduce(
    (sum, id) => sum + (input.etapas[id] ?? 0), 0
  );

  const horasEstimadas = horasBase * multTipo * multComplexidade;

  const custoHora = horasEstimadas * config.valorHora;
  const custoFixoProporcional =
    config.horasMensais > 0 && config.custosFixos > 0
      ? (config.custosFixos / config.horasMensais) * horasEstimadas
      : 0;
  const custoTotal = custoHora + custoFixoProporcional;

  const margem          = input.margemLucro / 100;
  const prazoMult       = PRAZO_MULT[input.prazo] ?? 1.0;
  const visibilidadeFat = input.visibilidade ? (1 - input.descontoVisibilidade / 100) : 1.0;

  const honorarioMinimo  = custoTotal;
  const honorarioIdeal   = custoTotal * (1 + margem) * prazoMult * visibilidadeFat;
  const honorarioPremium = honorarioIdeal * 1.25;

  const ajustePrazoValor = prazoMult > 1
    ? custoTotal * (1 + margem) * (prazoMult - 1) * visibilidadeFat
    : 0;
  const descontoVisibilidadeValor = input.visibilidade && input.descontoVisibilidade > 0
    ? custoTotal * (1 + margem) * prazoMult * (1 - visibilidadeFat)
    : 0;

  return {
    horasEstimadas,
    custoHora,
    custoFixoProporcional,
    custoTotal,
    honorarioMinimo,
    honorarioIdeal,
    honorarioPremium,
    ajustePrazoValor,
    descontoVisibilidadeValor,
  };
}

/* ── Persistência ───────────────────────────────────────── */

export type CalculoSalvo = {
  id: string;
  projetoId: string;   // "" se avulso
  nomeCliente: string;
  data: string;
  input: CalculoInput;
  result: CalculoResult;
  honorarioFinal: number;
};

const KEY = "archia_calculos";

export function getCalculos(): CalculoSalvo[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCalculo(c: CalculoSalvo): void {
  const list = getCalculos();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.unshift(c);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function getCalculoByProjeto(projetoId: string): CalculoSalvo | null {
  if (!projetoId) return null;
  return getCalculos().find((c) => c.projetoId === projetoId) ?? null;
}

/* ── Formatação ─────────────────────────────────────────── */

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.round(val));
}
