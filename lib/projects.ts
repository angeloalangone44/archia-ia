export type DocumentoTipo = "qualificacao" | "briefing" | "specs" | "proposta";

export type Projeto = {
  id: string;
  tipo: DocumentoTipo;
  nome: string;
  data: string;
  trecho: string;
};

const KEY = "archia_projetos";

export function getProjects(): Projeto[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Projeto[];
  } catch {
    return [];
  }
}

export function saveProject(p: Omit<Projeto, "id" | "data">): Projeto {
  const projeto: Projeto = {
    ...p,
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
  };
  const list = getProjects();
  list.unshift(projeto);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  return projeto;
}

export function deleteProject(id: string): void {
  const list = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "há 1 dia";
  if (days < 7) return `há ${days} dias`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "há 1 sem.";
  return `há ${weeks} sem.`;
}

export const TIPO_LABEL: Record<DocumentoTipo, string> = {
  qualificacao: "Qualificação",
  briefing:     "Briefing técnico",
  specs:        "Especificações",
  proposta:     "Proposta comercial",
};

export const TIPO_STYLE: Record<DocumentoTipo, { bg: string; color: string }> = {
  qualificacao: { bg: "#F0EDE6", color: "#6B5A3E" },
  briefing:     { bg: "#E8EFF6", color: "#1A3A5C" },
  specs:        { bg: "#FDF3DC", color: "#8B6914" },
  proposta:     { bg: "#EAF2EC", color: "#2D5A3D" },
};
