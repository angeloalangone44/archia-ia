export type CompromissoTipo = "reuniao" | "prazo" | "followup" | "visita" | "meta";

export type Compromisso = {
  id: string;
  titulo: string;
  tipo: CompromissoTipo;
  data: string;       // YYYY-MM-DD
  horario: string;    // HH:MM or ""
  clienteNome: string;
  projetoId: string;  // "" if not linked
  obs: string;
};

export const TIPO_LABEL: Record<CompromissoTipo, string> = {
  reuniao:  "Reunião com cliente",
  prazo:    "Prazo de entrega",
  followup: "Follow-up",
  visita:   "Visita técnica",
  meta:     "Meta interna",
};

export const TIPO_COLOR: Record<CompromissoTipo, string> = {
  reuniao:  "#2D5A3D",
  prazo:    "#C0392B",
  followup: "#2374AB",
  visita:   "#C06000",
  meta:     "#7B3FAD",
};

export const TIPO_BG: Record<CompromissoTipo, string> = {
  reuniao:  "#EAF2EC",
  prazo:    "#FDEDEC",
  followup: "#EBF5FB",
  visita:   "#FEF3E8",
  meta:     "#F5EEF8",
};

const KEY = "archia_compromissos";

export function getCompromissos(): Compromisso[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCompromisso(c: Compromisso): void {
  const list = getCompromissos();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.push(c);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteCompromisso(id: string): void {
  const list = getCompromissos().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getCompromissosByData(dateStr: string): Compromisso[] {
  return getCompromissos().filter((c) => c.data === dateStr);
}

export function getCompromissosByProjeto(projetoId: string): Compromisso[] {
  if (!projetoId) return [];
  return getCompromissos()
    .filter((c) => c.projetoId === projetoId && c.data >= todayStr())
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function getUpcomingCount(days = 7): number {
  const today = todayStr();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return getCompromissos().filter((c) => c.data >= today && c.data <= cutoffStr).length;
}

export function getNextCompromisso(projetoId: string): Compromisso | null {
  const list = getCompromissosByProjeto(projetoId);
  return list[0] ?? null;
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatData(str: string): string {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

export function relativeDay(str: string): string {
  const today = todayStr();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  if (str === today) return "hoje";
  if (str === tomorrowStr) return "amanhã";
  return formatData(str);
}
