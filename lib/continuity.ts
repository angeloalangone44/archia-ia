/* ── Modelo unificado de projeto ────────────────────────────
   Salvo em localStorage quando o briefing é gerado.
   Alimenta proposta, especificações e o painel consolidado.
──────────────────────────────────────────────────────────── */

export type PerfilEstetico = {
  tomPreferido: string; // "Cinza" | "Bege" | "Sem preferência"
  corGosta: string;
  corNaoQuer: string;
};

export type AmbienteUnificado = {
  label: string;
  estilo: string;
  paredeRevestimento: string;
  pisoRevestimento: string;
  iluminacao: string;
  madeira: string;
  itens: string[];
  aproveitarMoveis: string;
  aproveitarMoveisDetalhe: string;
  moveisExistentes: string;
  moveisExistentesDetalhe: string;
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
  // varanda
  churrasqueira: string;
  pergolado: string;
  fechamentoVaranda: string;
  piscina: string;
  // quarto
  tamanhoCama: string;
  tipoCabeceira: string;
  bancadaEstudos: string;
  penteadeira: string;
  // orçamento por item (chave = nome do item)
  valoresEstimados: Record<string, string>;
};

export type DocumentoGerado = {
  conteudo: string;
  data: string; // ISO
};

export type ProjetoUnificado = {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  // cliente
  clienteNome: string;
  localizacao: string;
  moradores: string;
  pet: string;
  obsGerais: string;
  perfilEstetico: PerfilEstetico;
  // projeto
  projetoTipo: string;
  projetoArea: string;
  projetoOrcamento: string;
  projetoPrazo: string;
  // ambientes (chave = room id)
  ambientes: Record<string, AmbienteUnificado>;
  // documentos gerados
  documentos: {
    briefing?: DocumentoGerado;
    proposta?: DocumentoGerado;
    specs?: DocumentoGerado;
  };
};

const KEY = "archia_continuity_v1";
const BOM_RE = new RegExp(String.fromCharCode(0xFEFF), "g");

function strip(s: string) { return s.replace(BOM_RE, ""); }

/* ── CRUD ────────────────────────────────────────────────── */

export function getProjetosUnificados(): ProjetoUnificado[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveProjetoUnificado(p: ProjetoUnificado): void {
  const list = getProjetosUnificados();
  const idx = list.findIndex((x) => x.id === p.id);
  const sanitized: ProjetoUnificado = { ...p, clienteNome: strip(p.clienteNome) };
  if (idx >= 0) list[idx] = sanitized;
  else list.unshift(sanitized);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export function getProjetoUnificadoById(id: string): ProjetoUnificado | null {
  return getProjetosUnificados().find((p) => p.id === id) ?? null;
}

export function getProjetoUnificadoByNome(nome: string): ProjetoUnificado | null {
  const n = nome.toLowerCase().trim();
  return getProjetosUnificados().find((p) => p.clienteNome.toLowerCase().trim() === n) ?? null;
}

/** Retorna o projeto mais recente com briefing mas sem o tipo de doc especificado (últimos 30 dias) */
export function getProjetoSemDoc(tipo: "proposta" | "specs"): ProjetoUnificado | null {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return (
    getProjetosUnificados().find(
      (p) =>
        p.documentos.briefing &&
        !p.documentos[tipo] &&
        new Date(p.criadoEm) >= cutoff
    ) ?? null
  );
}

/** Adiciona/atualiza documento gerado em um projeto */
export function addDocumentoAoProjeto(
  projetoId: string,
  tipo: "briefing" | "proposta" | "specs",
  conteudo: string
): void {
  const list = getProjetosUnificados();
  const p = list.find((x) => x.id === projetoId);
  if (!p) return;
  p.documentos[tipo] = { conteudo: strip(conteudo), data: new Date().toISOString() };
  p.atualizadoEm = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Atualiza campos de um projeto unificado */
export function updateProjetoUnificado(
  projetoId: string,
  changes: Partial<ProjetoUnificado>
): void {
  const list = getProjetosUnificados();
  const idx = list.findIndex((x) => x.id === projetoId);
  if (idx < 0) return;
  list[idx] = { ...list[idx], ...changes, atualizadoEm: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Atualiza valor estimado de um item em um ambiente */
export function updateValorEstimado(
  projetoId: string,
  ambienteId: string,
  itemNome: string,
  valor: string
): void {
  const list = getProjetosUnificados();
  const p = list.find((x) => x.id === projetoId);
  if (!p || !p.ambientes[ambienteId]) return;
  if (!p.ambientes[ambienteId].valoresEstimados) {
    p.ambientes[ambienteId].valoresEstimados = {};
  }
  p.ambientes[ambienteId].valoresEstimados[itemNome] = valor;
  p.atualizadoEm = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(list));
}

/* ── Helpers de serialização ─────────────────────────────── */

/** Converte ambientes unificados para string de briefing */
export function serializeAmbientesParaSpecs(ambientes: Record<string, AmbienteUnificado>): string {
  return Object.entries(ambientes)
    .map(([, a]) => {
      const linhas = [
        `[${a.label.toUpperCase()}]`,
        a.estilo && `• Estilo: ${a.estilo}`,
        a.paredeRevestimento && `• Parede: ${a.paredeRevestimento}`,
        a.pisoRevestimento && `• Piso: ${a.pisoRevestimento}`,
        a.iluminacao && `• Iluminação: ${a.iluminacao}`,
        a.madeira && `• Madeira: ${a.madeira}`,
        a.tipoBacia && `• Bacia: ${a.tipoBacia}${a.corBacia ? ` (${a.corBacia})` : ""}`,
        a.tipoCuba && `• Cuba: ${a.tipoCuba}`,
        a.tipoTorneira && `• Torneira: ${a.tipoTorneira}`,
        a.tipoChuveiro && `• Chuveiro: ${a.tipoChuveiro}`,
        a.materialBancada && `• Bancada: ${a.materialBancada}`,
        a.tipoMetal && `• Metal: ${a.tipoMetal}`,
        a.cooktop && `• Cooktop: ${a.cooktop}${a.numBocas ? ` (${a.numBocas} bocas)` : ""}`,
        a.coifa && `• Coifa/depurador: ${a.coifa}`,
        a.lavaLouca && `• Lava-louça: ${a.lavaLouca}`,
        a.cubaCozinha && `• Cuba cozinha: ${a.cubaCozinha}`,
        a.materialBancadaCozinha && `• Bancada cozinha: ${a.materialBancadaCozinha}`,
        a.tipoMetalCozinha && `• Metal cozinha: ${a.tipoMetalCozinha}`,
        a.churrasqueira && `• Churrasqueira: ${a.churrasqueira}`,
        a.pergolado && `• Pergolado: ${a.pergolado}`,
        a.tamanhoCama && `• Cama: ${a.tamanhoCama}`,
        a.tipoCabeceira && `• Cabeceira: ${a.tipoCabeceira}`,
        a.itens.length > 0 && `• Itens: ${a.itens.join(", ")}`,
        a.obs && `• Obs: ${a.obs}`,
      ].filter(Boolean);
      return linhas.join("\n");
    })
    .join("\n\n");
}
