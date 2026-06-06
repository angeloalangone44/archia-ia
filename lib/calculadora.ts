/* ── Complexidade ───────────────────────────────────────── */

export type Complexidade = "branca" | "cinza";

export const COMPLEXIDADE: Record<Complexidade, { label: string; desc: string; mult: number }> = {
  branca: {
    label: "Obra branca",
    desc:  "Apenas acabamentos e revestimentos (reforma, interiores sem estrutural)",
    mult:  1.0,
  },
  cinza: {
    label: "Obra cinza + branca",
    desc:  "Inclui estrutural e construção — nível de detalhamento muito maior",
    mult:  1.4,
  },
};

/* ── Tipo de projeto ────────────────────────────────────── */

export type TipoProjeto = "residencial" | "comercial";

/* ── Prazo ──────────────────────────────────────────────── */

export type PrazoAjuste = "normal" | "urgente" | "muito_urgente";

export const PRAZO: Record<PrazoAjuste, { label: string; mult: number }> = {
  normal:        { label: "Normal",             mult: 1.00 },
  urgente:       { label: "Urgente +20%",       mult: 1.20 },
  muito_urgente: { label: "Muito urgente +35%", mult: 1.35 },
};

/* ── Custos variáveis ───────────────────────────────────── */

export type CustoVariavelTipo = "renders" | "visitas" | "outro";

export type CustoVariavel = {
  id: string;
  tipo: CustoVariavelTipo;
  descricao: string;
  // renders
  qtdImagens?: number;
  valorPorImagem?: number;
  // visitas
  qtdVisitas?: number;
  valorPorVisita?: number;
  // outro / valor manual
  valor?: number;
};

export function totalCustoVariavel(c: CustoVariavel): number {
  if (c.tipo === "renders")  return (c.qtdImagens  ?? 0) * (c.valorPorImagem  ?? 0);
  if (c.tipo === "visitas")  return (c.qtdVisitas  ?? 0) * (c.valorPorVisita  ?? 0);
  return c.valor ?? 0;
}

/* ── Input ──────────────────────────────────────────────── */

export type EtapaCalculo = {
  id: string;
  nome: string;
  horas: number;      // horas configuradas / editadas para este projeto
  selecionada: boolean;
};

export type CalculoInput = {
  tipo: TipoProjeto | "";
  metragem: string;
  complexidade: Complexidade;
  etapas: EtapaCalculo[];
  prazo: PrazoAjuste;
  visibilidade: boolean;
  descontoVisibilidade: number;
  margemLucro: number;
  custosVariaveis: CustoVariavel[];
};

/* ── Resultado ──────────────────────────────────────────── */

export type CalculoResult = {
  horasBaseTipo:          number;
  horasEtapas:            number;
  horasEstimadas:         number;  // média entre os dois
  horasFinal:             number;  // × complexidade
  custoHora:              number;
  custoFixo:              number;
  custoBase:              number;
  margemValor:            number;
  ajustePrazoValor:       number;
  descontoVisibilidadeValor: number;
  honorarioIdeal:         number;
  honorarioMinimo:        number;
  honorarioPremium:       number;
  custosVariaveisTotal:   number;
  totalFinal:             number;   // ideal + variáveis
  totalMinimo:            number;   // mínimo + variáveis
  totalPremium:           number;   // premium + variáveis
};

/* ── Cálculo ────────────────────────────────────────────── */

export function calcular(
  input: CalculoInput,
  config: {
    valorHora: number;
    horasMensais: number;
    margemLucro: number;
    custosFixos: number;
    horasM2Residencial: number;
    horasM2Comercial: number;
  }
): CalculoResult | null {
  if (!input.tipo || config.valorHora <= 0) return null;
  const metragem = parseFloat(input.metragem);
  if (!metragem || metragem <= 0) return null;

  const horasM2 = input.tipo === "residencial"
    ? config.horasM2Residencial
    : config.horasM2Comercial;

  const horasBaseTipo = metragem * horasM2;

  const etapasSel = input.etapas.filter((e) => e.selecionada);
  const horasEtapas = etapasSel.reduce((s, e) => s + e.horas, 0);

  // média — se nenhuma etapa selecionada, usa só horas do tipo
  const horasEstimadas = etapasSel.length > 0
    ? (horasBaseTipo + horasEtapas) / 2
    : horasBaseTipo;

  const multComplexidade = COMPLEXIDADE[input.complexidade].mult;
  const horasFinal = horasEstimadas * multComplexidade;

  const custoHora = horasFinal * config.valorHora;
  const custoFixo = config.horasMensais > 0 && config.custosFixos > 0
    ? (config.custosFixos / config.horasMensais) * horasFinal
    : 0;
  const custoBase = custoHora + custoFixo;

  const margem   = input.margemLucro / 100;
  const prazoMlt = PRAZO[input.prazo].mult;
  const visFat   = input.visibilidade ? (1 - input.descontoVisibilidade / 100) : 1;

  const margemValor = custoBase * margem;
  const preAjuste   = custoBase * (1 + margem);

  const ajustePrazoValor = preAjuste * (prazoMlt - 1) * visFat;
  const descontoVisibilidadeValor = input.visibilidade
    ? preAjuste * prazoMlt * (1 - visFat)
    : 0;

  const honorarioIdeal   = preAjuste * prazoMlt * visFat;
  const honorarioMinimo  = custoBase;
  const honorarioPremium = honorarioIdeal * 1.25;

  const custosVariaveisTotal = input.custosVariaveis.reduce(
    (s, c) => s + totalCustoVariavel(c), 0
  );

  return {
    horasBaseTipo,
    horasEtapas,
    horasEstimadas,
    horasFinal,
    custoHora,
    custoFixo,
    custoBase,
    margemValor,
    ajustePrazoValor,
    descontoVisibilidadeValor,
    honorarioIdeal,
    honorarioMinimo,
    honorarioPremium,
    custosVariaveisTotal,
    totalFinal:   honorarioIdeal   + custosVariaveisTotal,
    totalMinimo:  honorarioMinimo  + custosVariaveisTotal,
    totalPremium: honorarioPremium + custosVariaveisTotal,
  };
}

/* ── Persistência ───────────────────────────────────────── */

export type CalculoSalvo = {
  id: string;
  projetoId: string;
  nomeCliente: string;
  data: string;
  input: CalculoInput;
  result: CalculoResult;
};

const KEY = "archia_calculos_v2";

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

/* ── Utilitário ─────────────────────────────────────────── */

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Math.round(val)
  );
}
