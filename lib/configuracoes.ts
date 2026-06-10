import type { TemaDocumento } from "./pdf-themes";
export type { TemaDocumento };

/* ── Tipos ──────────────────────────────────────────────── */

export type EtapaConfig = {
  id: string;
  nome: string;
  horas: number;
};

export type LogoPosicao = "cabecalho" | "marca-dagua";

export type ConfiguracaoEscritorio = {
  valorHora: number;
  horasMensais: number;
  margemLucro: number;
  custosFixos: number;
  etapas: EtapaConfig[];
  horasM2Residencial: number;
  horasM2Comercial: number;
  // Identidade visual
  logoBase64?: string;
  logoPosicao?: LogoPosicao;
  temaDocumento?: TemaDocumento;
};

/* ── Defaults ───────────────────────────────────────────── */

export const ETAPAS_PADRAO: EtapaConfig[] = [
  { id: "levantamento", nome: "Levantamento",            horas: 8  },
  { id: "briefing",     nome: "Briefing",                horas: 6  },
  { id: "preliminar",   nome: "Estudo preliminar",       horas: 16 },
  { id: "anteprojeto",  nome: "Anteprojeto",             horas: 24 },
  { id: "executivo",    nome: "Executivo",               horas: 40 },
  { id: "obra",         nome: "Acompanhamento de obra",  horas: 20 },
];

/* ── localStorage ───────────────────────────────────────── */

const KEY = "archia_config_escritorio";

export function getConfiguracoes(): ConfiguracaoEscritorio | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConfiguracaoEscritorio>;
    // garante defaults para campos novos
    return {
      valorHora:          parsed.valorHora          ?? 0,
      horasMensais:       parsed.horasMensais       ?? 0,
      margemLucro:        parsed.margemLucro        ?? 0,
      custosFixos:        parsed.custosFixos        ?? 0,
      etapas:             parsed.etapas             ?? ETAPAS_PADRAO,
      horasM2Residencial: parsed.horasM2Residencial ?? 1.5,
      horasM2Comercial:   parsed.horasM2Comercial   ?? 1.2,
      logoBase64:         parsed.logoBase64,
      logoPosicao:        parsed.logoPosicao        ?? "cabecalho",
      temaDocumento:      parsed.temaDocumento      ?? "classico",
    };
  } catch {
    return null;
  }
}

export function saveConfiguracoes(c: ConfiguracaoEscritorio): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function hasConfiguracoes(): boolean {
  const c = getConfiguracoes();
  return c !== null && c.valorHora > 0;
}

export function getConfiguracoesOrDefault(): ConfiguracaoEscritorio {
  return getConfiguracoes() ?? {
    valorHora: 0,
    horasMensais: 0,
    margemLucro: 0,
    custosFixos: 0,
    etapas: ETAPAS_PADRAO,
    horasM2Residencial: 1.5,
    horasM2Comercial: 1.2,
  };
}
