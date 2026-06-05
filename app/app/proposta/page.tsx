"use client";

import DocumentForm, {
  FormGrid, FormGroup, Input, Select, Textarea, SectionDivider,
} from "@/components/DocumentForm";
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

const STORAGE_KEY = "archia-estrutura-proposta";

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
            <Textarea
              placeholder={`Cole o texto de uma proposta anterior ou descreva as seções que você costuma incluir.\n\nExemplo de estrutura:\nApresentação → Escopo → Etapas → Honorários → Aceite\n\nOu cole uma proposta completa — do Word, PDF ou e-mail. A IA segue a mesma estrutura, tom e nível de detalhe.`}
              value={f.estruturaPersonalizada}
              onChange={set("estruturaPersonalizada")}
              style={{ minHeight: 160 }}
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

      <TemplateRenderer text={text} isStreaming={isLoading} visible={visible} nomeEscritorio={f.nomeEscritorio} />
    </div>
  );
}
