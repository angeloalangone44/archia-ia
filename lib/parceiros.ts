// NÃO CONECTAR AO MOTOR DE IA / GERAÇÃO DE ESPECIFICAÇÕES.
// Isso é intencional: existe uma decisão de produto pendente sobre
// conteúdo patrocinado e como ele seria sinalizado ao usuário final.
// Não integrar sem revisão explícita dessa decisão.

const KEY = "archia_parceiros_v1";

export type FaixaPreco = "econômico" | "médio" | "alto" | "";

export type Parceiro = {
  id: string;
  nome: string;
  categoria: string;
  fornece: string;
  faixaPreco: FaixaPreco;
  contatoNome: string;
  contatoTel: string;
  contatoEmail: string;
  obs: string;
  criadoEm: string;
};

export function getParceiros(): Parceiro[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Parceiro[];
  } catch {
    return [];
  }
}

function setParceiros(list: Parceiro[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function saveParceiro(p: Parceiro): void {
  const list = getParceiros();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  setParceiros(list);
}

export function deleteParceiro(id: string): void {
  setParceiros(getParceiros().filter((p) => p.id !== id));
}

export function emptyParceiro(): Parceiro {
  return {
    id: crypto.randomUUID(),
    nome: "",
    categoria: "",
    fornece: "",
    faixaPreco: "",
    contatoNome: "",
    contatoTel: "",
    contatoEmail: "",
    obs: "",
    criadoEm: new Date().toISOString(),
  };
}
