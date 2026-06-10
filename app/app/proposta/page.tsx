"use client";

import DocumentForm, {
  FormGrid, FormGroup, Input, Select, Textarea, SectionDivider,
} from "@/components/DocumentForm";
import FileUploadField from "@/components/FileUploadField";
import TemplateRenderer from "@/components/TemplateRenderer";
import { useGenerate } from "@/lib/useGenerate";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getArchiaProjects,
  getProjetosParaProposta,
  updateArchiaDocumento,
  type ArchiaProjetoUnificado,
} from "@/lib/archia-project";
import { getConfiguracoesOrDefault } from "@/lib/configuracoes";

const STORAGE_KEY = "archia-estrutura-proposta";

/* ── templates de proposta ──────────────────────────────── */

const PROPOSTA_TEMPLATES = [
  {
    id: "formal",
    label: "Formal e detalhado",
    desc: "Corporativo · estruturado · completo",
    icon: "📋",
    color: "#2374AB",
    bg: "#EBF5FB",
    conteudo: `ESTRUTURA DA PROPOSTA — Formal e detalhado

## 1. APRESENTAÇÃO DO ESCRITÓRIO
Apresentação institucional, histórico e diferenciais do escritório.

## 2. OBJETO DA PROPOSTA
Identificação clara do cliente, imóvel e tipo de serviço contratado.

## 3. ESCOPO DETALHADO DE SERVIÇOS
- Levantamento e diagnóstico
- Estudo preliminar
- Anteprojeto
- Projeto executivo (arquitetura + detalhamentos)
- Projeto legal (aprovações)
- Acompanhamento de obra

## 4. EXCLUSÕES DE ESCOPO
Projetos complementares (estrutural, hidráulico, elétrico), aprovações em condomínio, mobiliário.

## 5. CRONOGRAMA ESTIMADO
Tabela com etapas, duração e marcos de entrega.

## 6. HONORÁRIOS E CONDIÇÕES DE PAGAMENTO
Valor total, forma de pagamento, reajuste e critérios de alteração de escopo.

## 7. REVISÕES INCLUÍDAS
Número de rodadas de alteração por etapa.

## 8. RESPONSABILIDADES DO CLIENTE
Documentos a fornecer, disponibilidade para reuniões, aprovações dentro do prazo.

## 9. VALIDADE DA PROPOSTA
30 dias a partir da data de emissão.

## 10. CONDIÇÕES GERAIS
Direitos autorais, alterações de escopo, rescisão contratual.

## 11. ACEITE
Espaço para assinatura e data.`,
    exemplo: `# PROPOSTA DE SERVIÇOS DE ARQUITETURA

**Escritório:** Raupp Arquitetura
**Cliente:** Carlos e Ana Mendes
**Data:** 10/06/2025
**Validade:** 30 dias

## 1. APRESENTAÇÃO DO ESCRITÓRIO

A Raupp Arquitetura atua há 12 anos no mercado de interiores e arquitetura residencial de alto padrão. Nosso diferencial está na gestão integrada do projeto — do briefing ao acompanhamento de obra — com uso de metodologia BIM.

## 2. OBJETO DA PROPOSTA

Prestação de serviços de projeto de interiores para apartamento de 120m² localizado em Pinheiros, São Paulo.

## 3. ESCOPO DE SERVIÇOS

- **Levantamento:** visita técnica e levantamento dimensional
- **Estudo preliminar:** proposta de layout e conceito
- **Anteprojeto:** definição de materiais, mobiliário e acabamentos
- **Projeto executivo:** pranchas técnicas, detalhamentos e caderno de especificações

## 4. HONORÁRIOS

**Valor total:** R$ 45.000
**Pagamento:** 30% na assinatura · 40% na aprovação do anteprojeto · 30% na entrega do executivo`,
  },
  {
    id: "enxuto",
    label: "Próximo e enxuto",
    desc: "Caloroso · direto · pessoal",
    icon: "💬",
    color: "#2D5A3D",
    bg: "#EAF2EC",
    conteudo: `ESTRUTURA DA PROPOSTA — Próximo e enxuto

Mensagem pessoal de abertura — use o nome do cliente, mencione algo específico do projeto.

## O que vamos fazer juntos
Descrição do escopo em linguagem acessível, sem jargões. Etapas explicadas de forma simples.

## Investimento
Valor total e forma de pagamento. Explique o que está incluído e o que não está, sem tabelas extensas.

## Como funciona nossa parceria
Prazo, comunicação, número de revisões, o que você precisa do cliente para o projeto andar.

## Próximos passos
O que acontece depois da assinatura. Data de início, primeira reunião, o que você vai entregar primeiro.

P.S.: Pode fechar qualquer dúvida por mensagem — estou à disposição.`,
    exemplo: `# Proposta para a reforma do apartamento de vocês

Oi Carlos e Ana, tudo bem?

Fiquei muito feliz com nossa conversa e já estou cheio de ideias para o apartamento de vocês. Esse texto é só para formalizar o que discutimos — mas qualquer dúvida, é só mandar mensagem.

## O que vamos fazer juntos

Vou cuidar de todo o projeto de interiores do apê: desde o layout e a escolha dos materiais até os detalhamentos para a obra. São 4 etapas:

1. Estudo do layout e conceito visual
2. Escolha de materiais, cores e mobiliário
3. Projeto executivo para a obra
4. Acompanhamento durante a reforma

## Investimento

**R$ 45.000** — pagos em 3 partes:
- R$ 13.500 na assinatura
- R$ 18.000 na aprovação do projeto
- R$ 13.500 na entrega final

## Próximos passos

Assim que você assinar, agendo nossa primeira reunião de imersão. Em até 2 semanas você já terá o estudo preliminar na mão.

Abraços,
**Raupp Arquitetura**`,
  },
  {
    id: "portfolio",
    label: "Visual com portfólio",
    desc: "Showcase · criativo · projetos anteriores",
    icon: "🎨",
    color: "#7B3FAD",
    bg: "#F5EEF8",
    conteudo: `ESTRUTURA DA PROPOSTA — Visual com portfólio

## SOBRE O ESCRITÓRIO
História, filosofia de projeto e especialidades. O que nos diferencia no mercado.

## PROJETOS ANTERIORES
[Adicione aqui links ou referências aos seus projetos — fotos, portfólio online, Instagram]
- Projeto residencial — São Paulo, 2024
- Projeto comercial — Rio de Janeiro, 2023
- Reforma completa — Campinas, 2023

## NOSSO PROCESSO
Como trabalhamos do início ao fim: da conversa inicial à entrega da obra.

## ESCOPO DESTE PROJETO
O que será desenvolvido especificamente para o seu projeto.

## INVESTIMENTO E CONDIÇÕES
Honorários, forma de pagamento e validade da proposta.

## VAMOS COMEÇAR?
Call-to-action claro com próximos passos e dados de contato.`,
    exemplo: `# Proposta — Raupp Arquitetura

## Sobre nós

Criamos espaços que contam histórias. Trabalhamos com projetos residenciais de alto padrão em São Paulo, focados em design autoral, materiais naturais e funcionalidade.

📸 **Portfólio:** raupp.arq.br/portfolio
📱 **Instagram:** @raupp.arq

---

## Projetos recentes

**Residência Jardins** · São Paulo · 2024
Apartamento 180m² com conceito wabi-sabi

**Cobertura Moema** · São Paulo · 2023
Reforma completa com jardim suspenso integrado

**Casa Alto da Boa Vista** · São Paulo · 2022
Projeto novo de 320m² com foco em biofilia

---

## Escopo para o seu projeto

Projeto de interiores completo para o apartamento de 120m² em Pinheiros, incluindo: estudo preliminar, desenvolvimento de conceito, projeto executivo e acompanhamento de obra.

## Investimento

**R$ 45.000** · Validade: 30 dias
Formas de pagamento flexíveis — conversamos!`,
  },
];

/* ── modal de preview de template ──────────────────────── */

function TemplatePreviewModal({ template, onClose }: { template: typeof PROPOSTA_TEMPLATES[0]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--surface)", borderRadius: 16, maxWidth: 640, width: "100%", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <span>{template.icon}</span>
            <span className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>{template.label}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 18 }}>✕</button>
        </div>
        {/* Preview */}
        <div className="overflow-y-auto p-5" style={{ flex: 1 }}>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--ink3)" }}>Exemplo com dados fictícios</p>
          <div className="rounded-xl p-5 text-[12px] leading-relaxed whitespace-pre-wrap"
            style={{ background: template.bg, border: `0.5px solid ${template.color}22`, color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}>
            {template.exemplo}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── cards de templates ─────────────────────────────────── */

function TemplatesPropostaCards({ onSelect }: { onSelect: (conteudo: string) => void }) {
  const [preview, setPreview] = useState<typeof PROPOSTA_TEMPLATES[0] | null>(null);
  return (
    <div className="mb-4">
      <p className="text-[12px] mb-3" style={{ color: "var(--ink3)" }}>
        Ou escolha um template como ponto de partida:
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {PROPOSTA_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="rounded-xl p-3.5 flex flex-col gap-2.5"
            style={{ border: `0.5px solid ${tpl.color}33`, background: tpl.bg, cursor: "default" }}>
            <div className="flex items-start justify-between">
              <span className="text-xl">{tpl.icon}</span>
            </div>
            <div>
              <p className="text-[12px] font-medium leading-tight" style={{ color: tpl.color }}>{tpl.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: tpl.color, opacity: 0.7 }}>{tpl.desc}</p>
            </div>
            <div className="flex gap-1.5 mt-auto">
              <button type="button" onClick={() => onSelect(tpl.conteudo)}
                className="flex-1 text-[11px] py-1.5 rounded-lg font-medium"
                style={{ background: tpl.color, color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Usar
              </button>
              <button type="button" onClick={() => setPreview(tpl)}
                className="text-[11px] py-1.5 px-2.5 rounded-lg"
                style={{ background: "transparent", border: `0.5px solid ${tpl.color}55`, color: tpl.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>
      {preview && <TemplatePreviewModal template={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

/* ── seletor de projeto ─────────────────────────────────── */

function ProjectSelector({
  projetoId, onChange,
}: { projetoId: string; onChange: (id: string) => void }) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);

  useEffect(() => { setProjetos(getArchiaProjects()); }, []);
  if (projetos.length === 0) return null;

  return (
    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Projeto:</span>
      <select value={projetoId} onChange={(e) => onChange(e.target.value)}
        className="text-[13px] flex-1"
        style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <option value="">+ Novo projeto</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
        ))}
      </select>
    </div>
  );
}

/* ── banner de continuidade ─────────────────────────────── */

function ContinuidadeBanner({
  onCarregar,
}: {
  onCarregar: (p: ArchiaProjetoUnificado) => void;
}) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setProjetos(getProjetosParaProposta());
  }, []);

  if (dismissed || projetos.length === 0) return null;

  const p = projetos[0];

  return (
    <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "#EAF2EC", border: "1px solid #A8D5B2" }}>
      <div className="text-lg">💡</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium" style={{ color: "#1A3A1A" }}>
          Projeto de {p.cliente.nome} sem proposta — usar dados do briefing?
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#3A5A3A" }}>
          {p.projeto.tipo} · {p.cliente.localizacao || "sem localização"} · briefing gerado {new Date(p.documentos.briefing!.data).toLocaleDateString("pt-BR")}
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onCarregar(p); setDismissed(true); }}
            className="text-[12px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#2D5A3D", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Usar dados do briefing
          </button>
          <button onClick={() => setDismissed(true)}
            className="text-[12px] px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", border: "0.5px solid #A8D5B2", color: "#3A5A3A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ignorar
          </button>
        </div>
        {projetos.length > 1 && (
          <p className="text-[10px] mt-1.5" style={{ color: "#5A7A5A" }}>
            +{projetos.length - 1} outro{projetos.length > 2 ? "s" : ""} projeto{projetos.length > 2 ? "s" : ""} aguardando proposta
          </p>
        )}
      </div>
    </div>
  );
}

/* ── página ─────────────────────────────────────────────── */

export default function PropostaPage() {
  const { text, isLoading, visible, generate } = useGenerate();
  const router = useRouter();
  const [projetoId, setProjetoId] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);
  const [logoPosicao, setLogoPosicao] = useState<"cabecalho" | "marca-dagua">("cabecalho");
  const [temaDocumento, setTemaDocumento] = useState<import("@/lib/pdf-themes").TemaDocumento>("classico");

  const [f, setF] = useState({
    cliente: "", tipo: "", escopo: "",
    valor: "", pagto: "", prazo: "", validade: "", exclusoes: "", diferencial: "",
    revisoes: "", responsabilidadesCliente: "",
    nomeEscritorio: "", tomComunicacao: "", diferenciais: "", fraseApresentacao: "",
    estruturaPersonalizada: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setF((prev) => ({ ...prev, estruturaPersonalizada: saved }));
    const cfg = getConfiguracoesOrDefault();
    if (cfg.logoBase64) { setLogoBase64(cfg.logoBase64); setLogoPosicao(cfg.logoPosicao ?? "cabecalho"); }
    if (cfg.temaDocumento) setTemaDocumento(cfg.temaDocumento);

    // Carrega honorário sugerido pela calculadora
    const honorario = localStorage.getItem("archia_honorario_sugerido");
    if (honorario) {
      try {
        const h = JSON.parse(honorario);
        setF((prev) => ({ ...prev, valor: h.valor || prev.valor }));
        if (h.projetoId) setProjetoId(h.projetoId);
        localStorage.removeItem("archia_honorario_sugerido");
      } catch { /* ignore */ }
    }

    // URL param ?projeto=ID
    const params = new URLSearchParams(window.location.search);
    const id = params.get("projeto");
    if (id) handleSelectProject(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, f.estruturaPersonalizada);
  }, [f.estruturaPersonalizada]);

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSelectProject(id: string) {
    setProjetoId(id);
    if (!id) return;
    const projetos = getArchiaProjects();
    const p = projetos.find((x) => x.id === id);
    if (!p) return;
    setF((prev) => ({
      ...prev,
      cliente: p.cliente.nome,
      tipo: p.projeto.tipo,
      prazo: p.projeto.prazo,
    }));
  }

  function handleCarregarBriefing(p: ArchiaProjetoUnificado) {
    setProjetoId(p.id);
    setF((prev) => ({
      ...prev,
      cliente: p.cliente.nome,
      tipo: p.projeto.tipo,
      prazo: p.projeto.prazo,
    }));
  }

  function handleSubmit() {
    if (!f.cliente || !f.escopo || !f.valor) {
      alert("Preencha os campos obrigatórios: cliente, escopo e honorários.");
      return;
    }
    generate("proposta", f, f.cliente, (fullText) => {
      if (projetoId) {
        updateArchiaDocumento(projetoId, "proposta", fullText);
      }
    });
  }

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Proposta Comercial</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Informe escopo, honorários e a identidade do escritório — a IA gera uma proposta no seu tom
        </p>
      </div>

      <ContinuidadeBanner onCarregar={handleCarregarBriefing} />
      <ProjectSelector projetoId={projetoId} onChange={handleSelectProject} />

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar proposta comercial">
        <FormGrid>
          {/* ── Identidade do escritório ─────────────────────── */}
          <SectionDivider>Identidade do escritório</SectionDivider>

          <FormGroup label="Nome do escritório">
            <Input placeholder="Ex: Raupp Arquitetura" value={f.nomeEscritorio} onChange={set("nomeEscritorio")} />
          </FormGroup>
          <FormGroup label="Tom de comunicação">
            <Select value={f.tomComunicacao} onChange={set("tomComunicacao")}>
              <option value="">Selecione...</option>
              <option>Formal e técnico</option>
              <option>Próximo e pessoal</option>
              <option>Moderno e direto</option>
            </Select>
          </FormGroup>
          <FormGroup label="Diferenciais do escritório" full>
            <Textarea
              placeholder="Ex: especializado em alto padrão, uso de BIM, atendimento personalizado, 15 anos de experiência..."
              value={f.diferenciais}
              onChange={set("diferenciais")}
              style={{ minHeight: 70 }}
            />
          </FormGroup>
          <FormGroup label="Frase de apresentação (opcional)" full>
            <Input
              placeholder='Ex: "Transformamos espaços em experiências únicas, com olhar técnico e sensibilidade criativa."'
              value={f.fraseApresentacao}
              onChange={set("fraseApresentacao")}
            />
          </FormGroup>

          {/* ── Modelo de proposta ───────────────────────────── */}
          <SectionDivider>Modelo de proposta do escritório</SectionDivider>

          <FormGroup label="Cole uma proposta antiga como modelo (opcional)" full>
            <TemplatesPropostaCards onSelect={(c) => setF((prev) => ({ ...prev, estruturaPersonalizada: c }))} />
            <Textarea
              placeholder={`Cole o texto de uma proposta anterior ou descreva as seções que você costuma incluir.\n\nExemplo de estrutura:\nApresentação → Escopo → Etapas → Honorários → Aceite\n\nOu cole uma proposta completa — do Word, PDF ou e-mail. A IA segue a mesma estrutura, tom e nível de detalhe.`}
              value={f.estruturaPersonalizada}
              onChange={set("estruturaPersonalizada")}
              style={{ minHeight: 160 }}
            />
            <FileUploadField
              onExtracted={(text) => setF((prev) => ({ ...prev, estruturaPersonalizada: text }))}
            />
            <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--ink3)" }}>
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 flex-shrink-0" style={{ color: "var(--accent)" }}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Salvo automaticamente — use uma vez, serve para todas as propostas futuras
            </p>
          </FormGroup>

          {/* ── Dados da proposta ─────────────────────────────── */}
          <SectionDivider>Dados da proposta</SectionDivider>

          <FormGroup label="Nome do cliente" required>
            <Input placeholder="Ex: Carlos Mendes" value={f.cliente} onChange={set("cliente")} />
          </FormGroup>
          <FormGroup label="Tipo de projeto">
            <Select value={f.tipo} onChange={set("tipo")}>
              <option value="">Selecione...</option>
              <option>Projeto arquitetônico completo</option>
              <option>Projeto executivo</option>
              <option>Projeto de interiores</option>
              <option>Consultoria / assessoria</option>
              <option>Gerenciamento de obra</option>
            </Select>
          </FormGroup>
          <FormGroup label="Escopo de serviços" required full>
            <Textarea
              placeholder="Ex: estudo preliminar, anteprojeto, projeto legal, projeto executivo, acompanhamento de obra..."
              value={f.escopo}
              onChange={set("escopo")}
            />
          </FormGroup>

          {/* ── Honorários ───────────────────────────────────── */}
          <SectionDivider>Honorários</SectionDivider>

          <FormGroup label="Valor total dos honorários (R$)" required>
            <Input placeholder="Ex: R$ 45.000" value={f.valor} onChange={set("valor")} />
            <button
              type="button"
              onClick={() => router.push(projetoId ? `/app/calculadora?projeto=${projetoId}` : "/app/calculadora")}
              className="mt-1.5 text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h2m2 0h4M8 12h2m2 0h4M8 16h8" strokeLinecap="round"/>
              </svg>
              Calcular com a calculadora
            </button>
          </FormGroup>
          <FormGroup label="Forma de pagamento">
            <Input placeholder="Ex: 30% entrada, 40% aprovação, 30% conclusão" value={f.pagto} onChange={set("pagto")} />
          </FormGroup>
          <FormGroup label="Prazo estimado do projeto">
            <Input placeholder="Ex: 6 meses" value={f.prazo} onChange={set("prazo")} />
          </FormGroup>
          <FormGroup label="Validade da proposta">
            <Input placeholder="Ex: 30 dias" value={f.validade} onChange={set("validade")} />
          </FormGroup>
          <FormGroup label="Exclusões de escopo" full>
            <Textarea
              placeholder="Ex: projetos complementares (estrutural, paisagismo), aprovação em órgãos, taxas..."
              value={f.exclusoes}
              onChange={set("exclusoes")}
            />
          </FormGroup>
          <FormGroup label="Diferencial / argumento de valor" full>
            <Textarea
              placeholder="Ex: experiência em projetos similares, entregas em prazo, uso de BIM..."
              value={f.diferencial}
              onChange={set("diferencial")}
            />
          </FormGroup>
          <FormGroup label="Número de revisões incluídas">
            <Input
              placeholder="Ex: até 3 rodadas de alteração por etapa"
              value={f.revisoes}
              onChange={set("revisoes")}
            />
          </FormGroup>
          <FormGroup label="Responsabilidades do cliente" full>
            <Textarea
              placeholder="Ex: fornecer planta atualizada do imóvel, estar disponível para reuniões de alinhamento, aprovar etapas dentro do prazo"
              value={f.responsabilidadesCliente}
              onChange={set("responsabilidadesCliente")}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <TemplateRenderer text={text} isStreaming={isLoading} visible={visible} nomeEscritorio={f.nomeEscritorio} logoBase64={logoBase64} logoPosicao={logoPosicao} temaDocumento={temaDocumento} />
    </div>
  );
}
