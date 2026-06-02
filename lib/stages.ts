export type StageState = "pendente" | "em_andamento" | "concluida";

export type Stage = {
  id: string;
  nome: string;
  estado: StageState;
  prazo: string;
  concluidaEm: string;
  obs: string;
};

export const STAGE_DEFAULTS: Pick<Stage, "id" | "nome">[] = [
  { id: "qualificacao", nome: "Qualificação" },
  { id: "proposta",     nome: "Proposta enviada" },
  { id: "contrato",     nome: "Contrato assinado" },
  { id: "briefing",     nome: "Briefing" },
  { id: "preliminar",   nome: "Estudo preliminar" },
  { id: "anteprojeto",  nome: "Anteprojeto" },
  { id: "aprovacao",    nome: "Aprovação do cliente" },
  { id: "executivo",    nome: "Executivo" },
  { id: "entrega",      nome: "Entrega final" },
];

function makeDefault(): Stage[] {
  return STAGE_DEFAULTS.map((s) => ({
    ...s,
    estado: "pendente" as StageState,
    prazo: "",
    concluidaEm: "",
    obs: "",
  }));
}

const stageKey = (projetoId: string) => `archia_stages_${projetoId}`;

export function getStages(projetoId: string): Stage[] {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = localStorage.getItem(stageKey(projetoId));
    if (!raw) return makeDefault();
    const parsed: Stage[] = JSON.parse(raw);
    // Merge in case new default stages were added
    const defaults = makeDefault();
    return defaults.map((def) => parsed.find((p) => p.id === def.id) ?? def);
  } catch {
    return makeDefault();
  }
}

export function saveStages(projetoId: string, stages: Stage[]): void {
  localStorage.setItem(stageKey(projetoId), JSON.stringify(stages));
}

export function getStageProgress(projetoId: string): {
  concluidas: number;
  total: number;
  atual: string | null;
} {
  const stages = getStages(projetoId);
  const concluidas = stages.filter((s) => s.estado === "concluida").length;
  const atual = stages.find((s) => s.estado === "em_andamento")?.nome ?? null;
  return { concluidas, total: stages.length, atual };
}
