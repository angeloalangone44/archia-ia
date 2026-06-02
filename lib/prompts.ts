export const SYSTEM_BASE = `Você é um assistente especializado em arquitetura e projetos residenciais e comerciais no Brasil. Tem profundo conhecimento em normas ABNT (NBR 9050, NBR 6118, NBR 15575 e outras relevantes), materiais de construção, acabamentos e práticas do mercado brasileiro.

Seu papel é gerar documentos técnicos precisos, bem estruturados e profissionais para escritórios de arquitetura. Use terminologia técnica correta. Formate os documentos de forma clara, com seções bem definidas usando títulos em MAIÚSCULAS e subseções numeradas. Sempre inclua ressalvas quando necessário. Escreva sempre em português brasileiro.`;

/* ── TIPOS ──────────────────────────────────────────────── */

export type DocumentoTipo = "qualificacao" | "briefing" | "specs" | "proposta";

export type QualificacaoDados = {
  nome: string;
  tipoProjetoQual: string;
  metragem: string;
  orcamentoFaixa: string;
  prazo: string;
  cidade: string;
  comoConheceu: string;
  descricao: string;
};

export type BriefingDados = {
  tipoDetalhado: string;
  cliente: string;
  local: string;
  area: string;
  orcamento: string;
  prazo: string;
  moradores: string;
  pet: string;
  obsGerais: string;
  ambientesDetalhados: string; // formatado como texto por ambiente
  // modelo do escritório (opcional — salvo no localStorage)
  modeloBriefing: string;
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
  // identidade do escritório
  nomeEscritorio: string;
  tomComunicacao: string;
  diferenciais: string;
  fraseApresentacao: string;
  // estrutura personalizada (opcional — salvo no escritório)
  estruturaPersonalizada: string;
};

/* ── PROMPTS ────────────────────────────────────────────── */

export const PROMPTS: Record<DocumentoTipo, (dados: never) => string> = {

  qualificacao: (dados: QualificacaoDados) => `Analise as respostas de pré-qualificação de um potencial cliente de um escritório de arquitetura e gere um RELATÓRIO DE QUALIFICAÇÃO DE CLIENTE para o arquiteto.

O relatório deve conter EXATAMENTE estas seções:

1. PERFIL DO CLIENTE
   - Objetivo do projeto (resumido em 2–3 linhas)
   - Faixa de orçamento informada
   - Prazo desejado
   - Cidade / localização

2. PONTOS DE ATENÇÃO
   - Liste em bullets os riscos ou inconsistências detectados
   - Exemplos: orçamento incompatível com metragem e padrão estimado, prazo irreal, escopo mal definido
   - Se não houver pontos críticos, diga explicitamente "Nenhum ponto crítico identificado"

3. PERGUNTAS SUGERIDAS PARA A REUNIÃO INICIAL
   - Liste 5 a 7 perguntas específicas para aprofundar o entendimento
   - Baseie-se nas lacunas e ambiguidades das respostas

4. ADERÊNCIA AO PERFIL DO ESCRITÓRIO
   - Indique: ALTA / MÉDIA / BAIXA aderência
   - Justifique em 2–3 linhas com base nas informações fornecidas

RESPOSTAS DO FORMULÁRIO DE QUALIFICAÇÃO:
Nome do cliente: ${dados.nome}
Tipo de projeto: ${dados.tipoProjetoQual}
Metragem estimada: ${dados.metragem}
Faixa de orçamento: ${dados.orcamentoFaixa}
Prazo desejado: ${dados.prazo}
Cidade / bairro: ${dados.cidade}
Como conheceu o arquiteto: ${dados.comoConheceu}
Descrição do projeto (palavras do cliente): "${dados.descricao}"

Use linguagem objetiva e profissional. O relatório é para uso interno do arquiteto — seja direto e útil.`,

  briefing: (dados: BriefingDados) => {
    const formatoInstrucao = dados.modeloBriefing
      ? `MODELO DE BRIEFING DO ESCRITÓRIO — use como referência de estrutura, formato e tom. Reproduza o mesmo padrão de apresentação, substituindo pelos dados deste novo projeto. Não adicione seções que não existem no modelo:\n\n---\n${dados.modeloBriefing}\n---`
      : `FORMATO OBRIGATÓRIO DE OUTPUT:
- Use títulos em MAIÚSCULAS para cada ambiente
- Use bullet points (•) para cada item — NÃO use texto corrido
- Use ✓ para itens confirmados e ⚠ para pontos que exigem atenção
- Ao final, inclua seção "PONTOS DE ATENÇÃO" com inconsistências detectadas (ex: estilo clean selecionado mas com itens rústicos, orçamento incompatível com metragem)
- Se não houver inconsistências, liste as próximas etapas recomendadas`;

    return `Gere um BRIEFING TÉCNICO DE PROJETO por ambiente, em formato de checklist consolidada.

${formatoInstrucao}

INFORMAÇÕES GERAIS DO PROJETO:
Tipo: ${dados.tipoDetalhado}
Cliente: ${dados.cliente}
Localização: ${dados.local}
Área estimada: ${dados.area}
Orçamento: ${dados.orcamento}
Prazo: ${dados.prazo}
Moradores: ${dados.moradores}
Pet: ${dados.pet}
Observações gerais: ${dados.obsGerais}

DETALHES POR AMBIENTE:
${dados.ambientesDetalhados}

Gere o briefing por ambiente na ordem em que foram fornecidos. Seja específico e objetivo.`;
  },

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

  proposta: (dados: PropostaDados) => {
    const temIdentidade = dados.nomeEscritorio || dados.diferenciais || dados.fraseApresentacao;
    const identidadeBlock = temIdentidade ? `
IDENTIDADE DO ESCRITÓRIO (use para personalizar o tom e a apresentação):
Nome do escritório: ${dados.nomeEscritorio || "não informado"}
Tom de comunicação: ${dados.tomComunicacao || "profissional"}
Diferenciais: ${dados.diferenciais || "não informado"}
Frase de apresentação: ${dados.fraseApresentacao || "não informada"}
` : "";

    const instrucaoTom = dados.tomComunicacao === "próximo e pessoal"
      ? "INSTRUÇÃO DE TOM: escreva de forma calorosa, próxima e pessoal — como se o arquiteto estivesse conversando diretamente com o cliente. Use 'você', evite jargões excessivos."
      : dados.tomComunicacao === "moderno e direto"
      ? "INSTRUÇÃO DE TOM: escreva de forma moderna, objetiva e direta. Frases curtas, linguagem contemporânea, sem formalidade excessiva."
      : "INSTRUÇÃO DE TOM: escreva de forma formal, técnica e profissional. Use linguagem adequada para contratos e documentos formais.";

    const estruturaSecoes = dados.estruturaPersonalizada
      ? `\nMODELO DE PROPOSTA DO ESCRITÓRIO — use como referência de estrutura, tom, estilo e nível de detalhe. Substitua os dados de referência pelos dados reais do cliente fornecidos abaixo, mantendo a organização e voz do modelo original. Não invente seções que não existem no modelo:\n\n---\n${dados.estruturaPersonalizada}\n---\n`
      : `\nO documento deve conter:\n1. APRESENTAÇÃO DO ESCRITÓRIO (personalizada com os dados de identidade acima)\n2. OBJETO DA PROPOSTA\n3. ESCOPO DETALHADO DE SERVIÇOS (com etapas bem definidas)\n4. EXCLUSÕES DE ESCOPO\n5. CRONOGRAMA ESTIMADO\n6. HONORÁRIOS E CONDIÇÕES DE PAGAMENTO\n7. VALIDADE DA PROPOSTA\n8. CONDIÇÕES GERAIS (responsabilidades, alterações de escopo, direitos autorais)\n9. ACEITE (espaço para assinatura)\n`;

    return `Gere uma PROPOSTA COMERCIAL DE SERVIÇOS DE ARQUITETURA completa, profissional e pronta para envio ao cliente.

${instrucaoTom}

A proposta deve soar como se o próprio arquiteto tivesse escrito — não genérica, não de escritório fictício. Use as informações de identidade para personalizar apresentação, tom e argumentação de valor.
${identidadeBlock}
${estruturaSecoes}

DADOS FORNECIDOS:
Cliente: ${dados.cliente}
Tipo de projeto: ${dados.tipo}
Escopo: ${dados.escopo}
Honorários totais: ${dados.valor}
Forma de pagamento: ${dados.pagto}
Prazo do projeto: ${dados.prazo}
Validade da proposta: ${dados.validade}
Exclusões: ${dados.exclusoes}
Diferencial informado: ${dados.diferencial}`;
  },
};

export function buildSystemPrompt(extraContext?: string): string {
  if (!extraContext) return SYSTEM_BASE;
  return `${SYSTEM_BASE}\n\nCONTEXTO DO ESCRITÓRIO:\n${extraContext}`;
}
