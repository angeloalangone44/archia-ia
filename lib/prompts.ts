export const SYSTEM_BASE = `Você é um assistente especializado em arquitetura e projetos residenciais e comerciais no Brasil. Tem profundo conhecimento em normas ABNT (NBR 9050, NBR 6118, NBR 15575 e outras relevantes), materiais de construção, acabamentos e práticas do mercado brasileiro.

Seu papel é gerar documentos técnicos precisos, bem estruturados e profissionais para escritórios de arquitetura. Use terminologia técnica correta. Formate os documentos em Markdown com seções bem definidas (## para títulos de seção, ### para subseções, **negrito** para ênfase). Escreva sempre em português brasileiro.`;

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
  ambientesDetalhados: string;
  modeloBriefing: string;
  // perfil estético
  tomNeutro: string;
  corQueGosta: string;
  corQueNaoQuer: string;
  // referências visuais (links separados por \n)
  referenciasVisuais?: string;
};

export type SpecsDados = {
  projeto: string;
  padrao: string;
  tipo: string;
  ambientes: string;
  materiais: string;
  normas: string;
  // dados do briefing para continuidade
  briefingData?: string;
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
  revisoes: string;
  responsabilidadesCliente: string;
  // identidade do escritório
  nomeEscritorio: string;
  tomComunicacao: string;
  diferenciais: string;
  fraseApresentacao: string;
  estruturaPersonalizada: string;
};

/* ── PROMPTS ────────────────────────────────────────────── */

export const PROMPTS: Record<DocumentoTipo, (dados: never) => string> = {

  qualificacao: (dados: QualificacaoDados) => `Analise as respostas de pré-qualificação de um potencial cliente de um escritório de arquitetura e gere um RELATÓRIO DE QUALIFICAÇÃO DE CLIENTE para o arquiteto.

O relatório deve conter EXATAMENTE estas seções em Markdown:

## 1. PERFIL DO CLIENTE
- Objetivo do projeto (resumido em 2–3 linhas)
- Faixa de orçamento informada
- Prazo desejado
- Cidade / localização

## 2. PONTOS DE ATENÇÃO
- Liste em bullets os riscos ou inconsistências detectados
- Exemplos: orçamento incompatível com metragem e padrão estimado, prazo irreal, escopo mal definido
- Se não houver pontos críticos, escreva: **Nenhum ponto crítico identificado**

## 3. PERGUNTAS SUGERIDAS PARA A REUNIÃO INICIAL
- Liste 5 a 7 perguntas específicas para aprofundar o entendimento
- Baseie-se nas lacunas e ambiguidades das respostas

## 4. ADERÊNCIA AO PERFIL DO ESCRITÓRIO
- Indique: **ALTA / MÉDIA / BAIXA** aderência
- Justifique em 2–3 linhas com base nas informações fornecidas

RESPOSTAS DO FORMULÁRIO:
Nome: ${dados.nome}
Tipo: ${dados.tipoProjetoQual}
Metragem: ${dados.metragem}
Orçamento: ${dados.orcamentoFaixa}
Prazo: ${dados.prazo}
Cidade: ${dados.cidade}
Como conheceu: ${dados.comoConheceu}
Descrição: "${dados.descricao}"

Use linguagem objetiva e profissional. O relatório é para uso interno do arquiteto.`,

  briefing: (dados: BriefingDados) => {
    const perfilEstetico = [
      dados.tomNeutro && `- **Tom neutro preferido:** ${dados.tomNeutro}`,
      dados.corQueGosta && `- **Cor favorita:** ${dados.corQueGosta}`,
      dados.corQueNaoQuer && `- **Cor a evitar:** ${dados.corQueNaoQuer}`,
    ].filter(Boolean).join("\n");

    const referenciasBlock = dados.referenciasVisuais?.trim()
      ? `## REFERÊNCIAS VISUAIS FORNECIDAS PELO CLIENTE:\n${dados.referenciasVisuais.split("\n").filter(Boolean).map((l) => `- ${l}`).join("\n")}\n\nMencione essas referências na seção de CONCEITO NORTEADOR como "Referências visuais fornecidas pelo cliente". Não tente acessar os links — liste-os como fornecidos e comente que o arquiteto deve consultá-los diretamente.`
      : "";

    const formatoInstrucao = dados.modeloBriefing
      ? `MODELO DE BRIEFING DO ESCRITÓRIO — use como referência de estrutura, formato e tom. Reproduza o mesmo padrão substituindo pelos dados deste projeto:\n\n---\n${dados.modeloBriefing}\n---`
      : `## REGRAS DO OUTPUT:
- Use ## para cada ambiente (ex: ## SALA DE ESTAR)
- Use listas com "-" para cada item dentro do ambiente
- Use **negrito** para decisões confirmadas
- Use ⚠ APENAS para inconsistências reais ou informações AUSENTES que impactam o projeto — NUNCA para campos que foram preenchidos
- NÃO gere itens "⚠ Definir..." para campos que foram preenchidos — use as informações fornecidas diretamente
- Inclua TODOS os dados específicos preenchidos (tipo de bacia, cuba, material de bancada, torneira, etc.) — não generalize
- Ao final, inclua ## PRÓXIMAS ETAPAS com recomendações de encaminhamento
- Inclua uma seção final obrigatória ## ESPECIFICAÇÕES PRELIMINARES organizando os materiais e itens escolhidos por ambiente em formato de tabela ou lista estruturada — esta seção serve de base para o caderno de especificações e para orçamento`;

    return `Gere um BRIEFING TÉCNICO DE PROJETO por ambiente, em formato de checklist de decisões confirmadas.

${formatoInstrucao}

${referenciasBlock}

## INFORMAÇÕES GERAIS
- **Tipo:** ${dados.tipoDetalhado}
- **Cliente:** ${dados.cliente}
- **Localização:** ${dados.local}
- **Área estimada:** ${dados.area}
- **Orçamento:** ${dados.orcamento || "Não informado"} (use exatamente o valor informado pelo cliente, sem enquadrar em faixas)
- **Prazo:** ${dados.prazo}
- **Moradores:** ${dados.moradores}
- **Pet:** ${dados.pet}
- **Observações gerais:** ${dados.obsGerais}

${perfilEstetico ? `## PERFIL ESTÉTICO DO CLIENTE\n${perfilEstetico}\n\nIncorpore este perfil estético na seção de CONCEITO NORTEADOR e em cada ambiente — oriente as escolhas de cor, material e acabamento com base nessas preferências.` : ""}

## DETALHES POR AMBIENTE:
${dados.ambientesDetalhados}

Gere o briefing por ambiente na ordem fornecida. Trate cada dado preenchido como decisão confirmada do cliente, não como pendência.`;
  },

  specs: (dados: SpecsDados) => {
    const temBriefing = !!dados.briefingData;

    const instrucaoBriefing = temBriefing
      ? `IMPORTANTE: Este caderno é gerado a partir de dados coletados no briefing. Use as escolhas já feitas como ponto de partida obrigatório — não sugira materiais genéricos para itens onde o cliente já decidiu. Para cada escolha já definida, expanda com:
1. Norma ABNT aplicável (quando houver)
2. Dimensões padrão recomendadas
3. Observação técnica relevante (instalação, manutenção, cuidado especial)

DADOS DO BRIEFING:
${dados.briefingData}

---`
      : "";

    return `Gere um CADERNO DE ESPECIFICAÇÕES TÉCNICAS (rascunho) para o projeto abaixo.

${instrucaoBriefing}

Para cada ambiente listado, especifique em Markdown:
- Piso (material, espessura, acabamento, norma aplicável)
- Parede (revestimento, tinta, altura do revestimento se houver)
- Teto (forro, pintura, altura)
- Esquadrias (padrão indicado)
- Louças e metais (quando aplicável) — partindo das escolhas do briefing quando disponíveis
- Iluminação (tipo recomendado)
- Observações técnicas e normas relevantes

Inclua ao final ## MATERIAIS GERAIS e ## NORMAS ABNT APLICÁVEIS.

## DADOS DO PROJETO
- **Nome:** ${dados.projeto}
- **Padrão:** ${dados.padrao}
- **Tipo de obra:** ${dados.tipo}
- **Ambientes:** ${dados.ambientes}
- **Preferências de materiais:** ${dados.materiais}
- **Restrições:** ${dados.normas}

> ⚠ **AVISO:** Este é um rascunho técnico gerado por IA. Deve ser revisado e validado pelo arquiteto responsável antes de qualquer uso em projeto.`;
  },

  proposta: (dados: PropostaDados) => {
    const temIdentidade = dados.nomeEscritorio || dados.diferenciais || dados.fraseApresentacao;

    const identidadeBlock = temIdentidade ? `
## IDENTIDADE DO ESCRITÓRIO — use OBRIGATORIAMENTE para personalizar abertura, tom e argumentação:
- **Nome:** ${dados.nomeEscritorio || "não informado"}
- **Tom de comunicação:** ${dados.tomComunicacao || "profissional"}
- **Diferenciais:** ${dados.diferenciais || "não informado"}
- **Frase de apresentação:** ${dados.fraseApresentacao || "não informada"}

ATENÇÃO: A abertura da proposta DEVE mencionar o nome do escritório e seus diferenciais. Não use texto genérico como "nosso escritório" sem nome — use o nome real fornecido.
` : "";

    const instrucaoTom = dados.tomComunicacao?.toLowerCase().includes("próximo")
      ? `## TOM OBRIGATÓRIO — PRÓXIMO E PESSOAL:
Escreva como se o arquiteto estivesse conversando diretamente com o cliente. Use "você", linguagem calorosa e pessoal. Evite jargões técnicos desnecessários. A proposta deve soar como uma conversa de alguém que já conhece o cliente, não como um contrato frio.`
      : dados.tomComunicacao?.toLowerCase().includes("moderno")
      ? `## TOM OBRIGATÓRIO — MODERNO E DIRETO:
Frases curtas e objetivas. Linguagem contemporânea, sem formalidade excessiva. Vai direto ao ponto. Sem floreios ou enrolação.`
      : `## TOM OBRIGATÓRIO — FORMAL E TÉCNICO:
Linguagem formal e profissional. Terminologia técnica adequada. Tom de documento de contrato. Preciso e objetivo.`;

    const camposExtras = [
      dados.revisoes && `- **Revisões incluídas:** ${dados.revisoes}`,
      dados.responsabilidadesCliente && `- **Responsabilidades do cliente:** ${dados.responsabilidadesCliente}`,
    ].filter(Boolean).join("\n");

    const estruturaSecoes = dados.estruturaPersonalizada
      ? `## MODELO DO ESCRITÓRIO — siga esta estrutura, substituindo pelos dados reais do cliente:

---
${dados.estruturaPersonalizada}
---`
      : `## ESTRUTURA OBRIGATÓRIA DO DOCUMENTO:
1. **APRESENTAÇÃO DO ESCRITÓRIO** — personalizada com nome, diferenciais e frase de apresentação
2. **OBJETO DA PROPOSTA**
3. **ESCOPO DETALHADO DE SERVIÇOS** — com etapas bem definidas
4. **EXCLUSÕES DE ESCOPO**
5. **CRONOGRAMA ESTIMADO**
6. **HONORÁRIOS E CONDIÇÕES DE PAGAMENTO**
7. **REVISÕES INCLUÍDAS** — número de rodadas por etapa
8. **RESPONSABILIDADES DO CLIENTE** — o que o cliente deve fornecer e cumprir
9. **VALIDADE DA PROPOSTA**
10. **CONDIÇÕES GERAIS** — alterações de escopo, direitos autorais, rescisão
11. **ACEITE** — espaço para assinatura`;

    return `Gere uma PROPOSTA COMERCIAL DE SERVIÇOS DE ARQUITETURA completa, profissional e pronta para envio ao cliente.

${instrucaoTom}

A proposta deve soar como se o próprio arquiteto tivesse escrito — não genérica. Use as informações de identidade para personalizar cada seção.

${identidadeBlock}
${estruturaSecoes}

## DADOS DA PROPOSTA:
- **Cliente:** ${dados.cliente}
- **Tipo de projeto:** ${dados.tipo}
- **Escopo:** ${dados.escopo}
- **Honorários totais:** ${dados.valor}
- **Forma de pagamento:** ${dados.pagto}
- **Prazo do projeto:** ${dados.prazo}
- **Validade da proposta:** ${dados.validade}
- **Exclusões de escopo:** ${dados.exclusoes}
- **Diferencial / argumento de valor:** ${dados.diferencial}
${camposExtras}

Formate em Markdown. Use ## para seções principais, ### para subseções, listas com "-" para items, **negrito** para termos importantes.`;
  },
};

export function buildSystemPrompt(extraContext?: string): string {
  if (!extraContext) return SYSTEM_BASE;
  return `${SYSTEM_BASE}\n\nCONTEXTO DO ESCRITÓRIO:\n${extraContext}`;
}
