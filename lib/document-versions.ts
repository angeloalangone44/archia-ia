export type DocumentoOrigem = "ia" | "edicao_manual" | "edicao_ia";
export type DocumentoStatus = "rascunho" | "enviado_ao_cliente" | "aprovado";
export type DocTipoVersao = "briefing" | "proposta" | "specs";

export type DocumentoVersao = {
  versao: number;
  timestamp: string;
  origem: DocumentoOrigem;
  status: DocumentoStatus;
  conteudo: string;
};

function key(projetoId: string, tipo: DocTipoVersao) {
  return `archia_versoes_${projetoId}_${tipo}`;
}

export function getVersoes(projetoId: string, tipo: DocTipoVersao): DocumentoVersao[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key(projetoId, tipo)) ?? "[]"); }
  catch { return []; }
}

function saveVersoes(projetoId: string, tipo: DocTipoVersao, versoes: DocumentoVersao[]) {
  localStorage.setItem(key(projetoId, tipo), JSON.stringify(versoes));
}

export function addVersao(
  projetoId: string,
  tipo: DocTipoVersao,
  partial: Omit<DocumentoVersao, "versao">
): DocumentoVersao {
  const existing = getVersoes(projetoId, tipo);
  const nova: DocumentoVersao = { ...partial, versao: existing.length + 1 };
  saveVersoes(projetoId, tipo, [...existing, nova]);
  return nova;
}

export function updateVersaoStatus(
  projetoId: string,
  tipo: DocTipoVersao,
  versaoNum: number,
  status: DocumentoStatus
) {
  saveVersoes(projetoId, tipo,
    getVersoes(projetoId, tipo).map((v) => v.versao === versaoNum ? { ...v, status } : v)
  );
}

export function updateVersaoConteudo(
  projetoId: string,
  tipo: DocTipoVersao,
  versaoNum: number,
  conteudo: string
) {
  saveVersoes(projetoId, tipo,
    getVersoes(projetoId, tipo).map((v) => v.versao === versaoNum ? { ...v, conteudo } : v)
  );
}

export function duplicarVersao(
  projetoId: string,
  tipo: DocTipoVersao,
  versaoNum: number
): DocumentoVersao | null {
  const original = getVersoes(projetoId, tipo).find((v) => v.versao === versaoNum);
  if (!original) return null;
  return addVersao(projetoId, tipo, {
    conteudo: original.conteudo,
    origem: "edicao_manual",
    status: "rascunho",
    timestamp: new Date().toISOString(),
  });
}
