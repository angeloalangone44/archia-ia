export const SYSTEM_BASE = `Você é um assistente especializado em arquitetura e projetos residenciais e comerciais no Brasil. Tem profundo conhecimento em normas ABNT (NBR 9050, NBR 6118, NBR 15575 e outras relevantes), materiais de construção, acabamentos e práticas do mercado brasileiro.

Seu papel é gerar documentos técnicos precisos, bem estruturados e profissionais para escritórios de arquitetura. Use terminologia técnica correta. Formate os documentos de forma clara, com seções bem definidas usando títulos em MAIÚSCULAS e subseções numeradas. Sempre inclua ressalvas quando necessário. Escreva sempre em português brasileiro.`;

export type BriefingDados = {
  cliente: string;
  tipo: string;
  area: string;
  local: string;
  orcamento: string;
  prazo: string;
  moradores: string;
  pet: string;
  ambientes: string;
  estilo: string;
  restricoes: string;
  obs: string;
};

export type SpecsDados = {
  projeto: string;
  padrao: string;
  tipo: string;
  ambientes: string;
  materiais: string;
  normas: string;
};

export type PropostaDados = {
  cliente: string;
  tipo: string;
  escopo: string;
  valor: string;
  pagto: string;
  prazo: string;
  validade: string;
  exclusoes: string;
  diferencial: string;
};

export type DocumentoTipo = "briefing" | "specs" | "proposta";

export const PROMPTS = {
  briefing: (dados: BriefingDados) => `Gere um BRIEFING TÉCNICO DE PROJETO completo e profissional com base nas informações abaixo.

O documento deve conter as seções:
1. IDENTIFICAÇÃO DO CLIENTE E PROJETO
2. PROGRAMA DE NECESSIDADES (lista detalhada de ambientes e requisitos)
3. CONDICIONANTES E RESTRIÇÕES
4. REFERÊNCIAS ESTÉTICAS E CONCEITO NORTEADOR
5. CRONOGRAMA E ORÇAMENTO ESTIMADO
6. OBSERVAÇÕES TÉCNICAS RELEVANTES
7. PRÓXIMAS ETAPAS RECOMENDADAS

DADOS FORNECIDOS:
Cliente: ${dados.cliente}
Tipo de projeto: ${dados.tipo}
Área estimada: ${dados.area}
Localização: ${dados.local}
Orçamento: ${dados.orcamento}
Prazo desejado: ${dados.prazo}
Moradores: ${dados.moradores}
Pet: ${dados.pet}
Ambientes desejados: ${dados.ambientes}
Estilo / referências: ${dados.estilo}
Restrições / necessidades especiais: ${dados.restricoes}
Observações da reunião: ${dados.obs}

Gere o documento de forma profissional, completo e direto para uso imediato pelo escritório.`,

  specs: (dados: SpecsDados) => `Gere um CADERNO DE ESPECIFICAÇÕES TÉCNICAS (rascunho) para o projeto abaixo.

Para cada ambiente listado, especifique:
- Piso (material, espessura, acabamento, norma aplicável)
- Parede (revestimento, tinta, altura do revestimento se houver)
- Teto (forro, pintura, altura)
- Esquadrias (padrão indicado)
- Louças e metais (quando aplicável)
- Iluminação (tipo recomendado)
- Observações técnicas e normas relevantes

Inclua ao final uma seção de MATERIAIS GERAIS e NORMAS ABNT APLICÁVEIS ao projeto.

DADOS DO PROJETO:
Nome do projeto: ${dados.projeto}
Padrão: ${dados.padrao}
Tipo de obra: ${dados.tipo}
Ambientes: ${dados.ambientes}
Preferências de materiais: ${dados.materiais}
Restrições / condicionantes: ${dados.normas}

IMPORTANTE: Ao final, inclua ressalva clara de que este é um rascunho técnico e deve ser revisado pelo arquiteto responsável antes de uso em projeto.`,

  proposta: (dados: PropostaDados) => `Gere uma PROPOSTA COMERCIAL DE SERVIÇOS DE ARQUITETURA completa, profissional e pronta para envio ao cliente.

O documento deve conter:
1. APRESENTAÇÃO DO ESCRITÓRIO (breve, baseada no contexto disponível)
2. OBJETO DA PROPOSTA
3. ESCOPO DETALHADO DE SERVIÇOS (com etapas bem definidas)
4. EXCLUSÕES DE ESCOPO
5. CRONOGRAMA ESTIMADO
6. HONORÁRIOS E CONDIÇÕES DE PAGAMENTO
7. VALIDADE DA PROPOSTA
8. CONDIÇÕES GERAIS (responsabilidades, alterações de escopo, direitos autorais)
9. ACEITE (espaço para assinatura)

DADOS FORNECIDOS:
Cliente: ${dados.cliente}
Tipo de projeto: ${dados.tipo}
Escopo: ${dados.escopo}
Honorários totais: ${dados.valor}
Forma de pagamento: ${dados.pagto}
Prazo do projeto: ${dados.prazo}
Validade da proposta: ${dados.validade}
Exclusões: ${dados.exclusoes}
Diferencial do escritório: ${dados.diferencial}

Escreva em tom profissional mas acessível. Use linguagem clara para o cliente leigo entender o que está contratando.`,
} satisfies Record<DocumentoTipo, (dados: never) => string>;

export function buildSystemPrompt(extraContext?: string): string {
  if (!extraContext) return SYSTEM_BASE;
  return `${SYSTEM_BASE}\n\nCONTEXTO DO ESCRITÓRIO:\n${extraContext}`;
}
