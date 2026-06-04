// Unified project model for archi.ia v0.3
// Stores complete client + project + ambiente + document data

export type AmbienteData = {
  estilo: string;
  paredeRevestimento: string;
  pisoRevestimento: string;
  iluminacao: string;
  madeira: string;
  itens: string[];
  // móveis existentes
  aproveitarMoveis: string;
  aproveitarMoveisDetalhe: string;
  // móveis novos
  moveisNovos: string;
  moveisNovosDetalhe: string;
  obs: string;
  // banheiro / lavabo
  tipoBacia: string;
  corBacia: string;
  tipoCuba: string;
  tipoTorneira: string;
  tipoChuveiro: string;
  materialBancada: string;
  tipoMetal: string;
  // cozinha
  cooktop: string;
  numBocas: string;
  coifa: string;
  lavaLouca: string;
  cubaCozinha: string;
  materialBancadaCozinha: string;
  tipoMetalCozinha: string;
  // quartos
  tamanhoCama: string;
  tipoCabeceira: string;
  bancadaEstudos: string;
  penteadeira: string;
  // varanda
  churrasqueira: string;
  pergolado: string;
  fechamentoVaranda: string;
  piscina: string;
  // valores estimados por item (campo: "Cooktop" → "R$ 2.500")
  valoresEstimados: Record<string, string>;
};

export type ArchiaProjetoUnificado = {
  id: string;
  createdAt: string;
  updatedAt: string;
  cliente: {
    nome: string;
    localizacao: string;
    moradores: string;
    pet: string;
    perfilEstetico: {
      tomNeutro: string;
      corQueGosta: string;
      corQueNaoQuer: string;
    };
  };
  projeto: {
    tipo: string;
    area: string;
    orcamento: string;
    prazo: string;
  };
  ambientes: Record<string, AmbienteData>;
  ambientesOrdem: string[];
  documentos: {
    briefing?: { conteudo: string; data: string };
    proposta?: { conteudo: string; data: string };
    especificacoes?: { conteudo: string; data: string };
  };
};

const KEY = "archia_v2_projetos";

export function getArchiaProjects(): ArchiaProjetoUnificado[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveArchiaProject(projeto: ArchiaProjetoUnificado): void {
  const list = getArchiaProjects();
  const idx = list.findIndex((p) => p.id === projeto.id);
  const updated = { ...projeto, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export function getArchiaProjectById(id: string): ArchiaProjetoUnificado | null {
  return getArchiaProjects().find((p) => p.id === id) ?? null;
}

export function deleteArchiaProject(id: string): void {
  const list = getArchiaProjects().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

const DIAS_30 = 30 * 24 * 60 * 60 * 1000;

export function getProjetosParaProposta(): ArchiaProjetoUnificado[] {
  const cutoff = Date.now() - DIAS_30;
  return getArchiaProjects().filter(
    (p) =>
      p.documentos.briefing &&
      !p.documentos.proposta &&
      new Date(p.documentos.briefing.data).getTime() > cutoff
  );
}

export function getProjetosParaSpecs(): ArchiaProjetoUnificado[] {
  const cutoff = Date.now() - DIAS_30;
  return getArchiaProjects().filter(
    (p) =>
      p.documentos.briefing &&
      !p.documentos.especificacoes &&
      new Date(p.documentos.briefing.data).getTime() > cutoff
  );
}

export function updateArchiaDocumento(
  projetoId: string,
  tipo: "briefing" | "proposta" | "especificacoes",
  conteudo: string
): void {
  const projeto = getArchiaProjectById(projetoId);
  if (!projeto) return;
  projeto.documentos[tipo] = { conteudo, data: new Date().toISOString() };
  saveArchiaProject(projeto);
}

export function updateAmbienteValorEstimado(
  projetoId: string,
  ambienteId: string,
  campo: string,
  valor: string
): void {
  const projeto = getArchiaProjectById(projetoId);
  if (!projeto || !projeto.ambientes[ambienteId]) return;
  projeto.ambientes[ambienteId].valoresEstimados = {
    ...(projeto.ambientes[ambienteId].valoresEstimados || {}),
    [campo]: valor,
  };
  saveArchiaProject(projeto);
}

export function emptyAmbiente(): AmbienteData {
  return {
    estilo: "", paredeRevestimento: "", pisoRevestimento: "",
    iluminacao: "", madeira: "", itens: [],
    aproveitarMoveis: "", aproveitarMoveisDetalhe: "",
    moveisNovos: "", moveisNovosDetalhe: "",
    obs: "",
    tipoBacia: "", corBacia: "",
    tipoCuba: "", tipoTorneira: "", tipoChuveiro: "", materialBancada: "", tipoMetal: "",
    cooktop: "", numBocas: "", coifa: "", lavaLouca: "", cubaCozinha: "",
    materialBancadaCozinha: "", tipoMetalCozinha: "",
    tamanhoCama: "", tipoCabeceira: "", bancadaEstudos: "", penteadeira: "",
    churrasqueira: "", pergolado: "", fechamentoVaranda: "", piscina: "",
    valoresEstimados: {},
  };
}

export const AMBIENTE_LABELS: Record<string, string> = {
  "sala":         "Sala de estar / jantar",
  "cozinha":      "Cozinha",
  "quarto-casal": "Quarto casal",
  "quarto-kids":  "Quarto kids",
  "banheiro":     "Banheiro",
  "lavabo":       "Lavabo",
  "closet":       "Closet",
  "area-servico": "Área de serviço",
  "varanda":      "Varanda / área gourmet",
  "home-office":  "Home office",
};
