"use client";

import DocumentForm, {
  FormGrid,
  FormGroup,
  Select,
  Textarea,
  Input,
} from "@/components/DocumentForm";
import TemplateRenderer from "@/components/TemplateRenderer";
import { useGenerate } from "@/lib/useGenerate";
import { useEffect, useState } from "react";
import {
  getArchiaProjects,
  getProjetosParaSpecs,
  updateArchiaDocumento,
  type ArchiaProjetoUnificado,
  AMBIENTE_LABELS,
} from "@/lib/archia-project";

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

function ContinuidadeBanner({ onCarregar }: { onCarregar: (p: ArchiaProjetoUnificado) => void }) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { setProjetos(getProjetosParaSpecs()); }, []);

  if (dismissed || projetos.length === 0) return null;
  const p = projetos[0];

  return (
    <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "#FDF3DC", border: "1px solid #E8CC80" }}>
      <div className="text-lg">📐</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium" style={{ color: "#5A3A00" }}>
          Projeto de {p.cliente.nome} — usar especificações do briefing?
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#8B6914" }}>
          {Object.keys(p.ambientes).length} ambiente{Object.keys(p.ambientes).length !== 1 ? "s" : ""} com dados coletados
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onCarregar(p); setDismissed(true); }}
            className="text-[12px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#7A5C14", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Usar dados do briefing
          </button>
          <button onClick={() => setDismissed(true)}
            className="text-[12px] px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", border: "0.5px solid #E8CC80", color: "#8B6914", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── serializar dados do briefing para o prompt ─────────── */

function serializeBriefingParaSpecs(p: ArchiaProjetoUnificado): string {
  const linhas: string[] = [
    `Cliente: ${p.cliente.nome}`,
    `Tipo: ${p.projeto.tipo}`,
    `Área: ${p.projeto.area}`,
    `Padrão/orçamento: ${p.projeto.orcamento}`,
    "",
    "ESPECIFICAÇÕES COLETADAS NO BRIEFING:",
  ];
  p.ambientesOrdem.forEach((id) => {
    const label = AMBIENTE_LABELS[id] ?? id;
    const d = p.ambientes[id];
    if (!d) return;
    linhas.push(`\n[${label.toUpperCase()}]`);
    if (d.estilo) linhas.push(`• Estilo: ${d.estilo}`);
    if (d.paredeRevestimento) linhas.push(`• Parede: ${d.paredeRevestimento}`);
    if (d.pisoRevestimento) linhas.push(`• Piso: ${d.pisoRevestimento}`);
    if (d.iluminacao) linhas.push(`• Iluminação: ${d.iluminacao}`);
    if (d.madeira) linhas.push(`• Tom de madeira: ${d.madeira}`);
    if (d.tipoBacia) linhas.push(`• Bacia: ${d.tipoBacia}${d.corBacia ? ` — ${d.corBacia}` : ""}`);
    if (d.tipoCuba) linhas.push(`• Cuba: ${d.tipoCuba}`);
    if (d.tipoTorneira) linhas.push(`• Torneira: ${d.tipoTorneira}`);
    if (d.tipoChuveiro) linhas.push(`• Chuveiro: ${d.tipoChuveiro}`);
    if (d.materialBancada) linhas.push(`• Bancada: ${d.materialBancada}`);
    if (d.tipoMetal) linhas.push(`• Metal: ${d.tipoMetal}`);
    if (d.cooktop) linhas.push(`• Cooktop: ${d.cooktop}${d.numBocas ? ` — ${d.numBocas} bocas` : ""}`);
    if (d.coifa) linhas.push(`• Coifa: ${d.coifa}`);
    if (d.lavaLouca) linhas.push(`• Lava-louça: ${d.lavaLouca}`);
    if (d.cubaCozinha) linhas.push(`• Cuba cozinha: ${d.cubaCozinha}`);
    if (d.materialBancadaCozinha) linhas.push(`• Bancada cozinha: ${d.materialBancadaCozinha}`);
    if (d.tipoMetalCozinha) linhas.push(`• Metal cozinha: ${d.tipoMetalCozinha}`);
    if (d.tamanhoCama) linhas.push(`• Cama: ${d.tamanhoCama}`);
    if (d.tipoCabeceira) linhas.push(`• Cabeceira: ${d.tipoCabeceira}`);
    if (d.churrasqueira && d.churrasqueira !== "Não") linhas.push(`• Churrasqueira: ${d.churrasqueira}`);
    if (d.itens.length > 0) linhas.push(`• Itens: ${d.itens.join(", ")}`);
    if (d.obs) linhas.push(`• Obs: ${d.obs}`);
  });
  return linhas.join("\n");
}

/* ── página ─────────────────────────────────────────────── */

export default function SpecsPage() {
  const { text, isLoading, visible, generate } = useGenerate();
  const [projetoId, setProjetoId] = useState("");
  const [briefingData, setBriefingData] = useState("");

  const [f, setF] = useState({
    projeto: "", padrao: "", tipo: "",
    ambientes: "", materiais: "", normas: "",
  });

  const set = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSelectProject(id: string) {
    setProjetoId(id);
    if (!id) { setBriefingData(""); return; }
    const p = getArchiaProjects().find((x) => x.id === id);
    if (!p) return;
    setF((prev) => ({
      ...prev,
      projeto: `${p.cliente.nome} — ${p.projeto.tipo || "Residência"}`,
      ambientes: p.ambientesOrdem
        .map((a) => AMBIENTE_LABELS[a] ?? a)
        .join(", "),
    }));
    if (p.documentos.briefing) {
      setBriefingData(serializeBriefingParaSpecs(p));
    }
  }

  function handleCarregarBriefing(p: ArchiaProjetoUnificado) {
    setProjetoId(p.id);
    const bd = serializeBriefingParaSpecs(p);
    setBriefingData(bd);
    setF((prev) => ({
      ...prev,
      projeto: `${p.cliente.nome} — ${p.projeto.tipo || "Residência"}`,
      padrao: p.projeto.orcamento
        ? p.projeto.orcamento.includes("500") ? "Alto padrão"
          : p.projeto.orcamento.includes("300") ? "Médio padrão"
          : "Médio padrão"
        : prev.padrao,
      ambientes: p.ambientesOrdem
        .map((a) => AMBIENTE_LABELS[a] ?? a)
        .join(", "),
    }));
  }

  function handleSubmit() {
    if (!f.projeto || !f.padrao || !f.ambientes) {
      alert("Preencha os campos obrigatórios: nome do projeto, padrão e ambientes.");
      return;
    }
    generate("specs", { ...f, briefingData }, f.projeto, (fullText) => {
      if (projetoId) {
        updateArchiaDocumento(projetoId, "especificacoes", fullText);
      }
    });
  }

  const warning = (
    <div className="rounded-[10px] px-4 py-3 text-xs leading-relaxed"
      style={{ background: "var(--gold-light)", border: "0.5px solid rgba(139,105,20,0.2)", color: "#6B4C10" }}>
      ⚠️ <strong>Importante:</strong> o caderno gerado é um rascunho técnico de referência.
      Sempre revise normas ABNT, especificações de fabricantes e condicionantes locais antes
      de usar em projeto.
    </div>
  );

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Caderno de Especificações
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Informe os ambientes e padrão — a IA gera o caderno (rascunho técnico)
        </p>
      </div>

      <ContinuidadeBanner onCarregar={handleCarregarBriefing} />
      <ProjectSelector projetoId={projetoId} onChange={handleSelectProject} />

      {briefingData && (
        <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-2"
          style={{ background: "#EAF2EC", border: "0.5px solid #A8D5B2" }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: "#2D5A3D" }}>
            <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-[12px]" style={{ color: "#1A3A1A" }}>
            Dados do briefing carregados — a IA vai usar as escolhas já feitas como ponto de partida.
          </p>
          <button onClick={() => setBriefingData("")}
            className="ml-auto text-[11px]" style={{ color: "#5A7A5A", background: "none", border: "none", cursor: "pointer" }}>
            Remover
          </button>
        </div>
      )}

      <DocumentForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        buttonLabel="Gerar caderno de especificações"
        warning={warning}
      >
        <FormGrid>
          <FormGroup label="Nome / referência do projeto" required full>
            <Input placeholder="Ex: Residência Costa — Pinheiros" value={f.projeto} onChange={set("projeto")} />
          </FormGroup>
          <FormGroup label="Padrão do projeto" required>
            <Select value={f.padrao} onChange={set("padrao")}>
              <option value="">Selecione...</option>
              <option>Econômico</option>
              <option>Médio padrão</option>
              <option>Alto padrão</option>
              <option>Luxo</option>
            </Select>
          </FormGroup>
          <FormGroup label="Tipo de obra">
            <Select value={f.tipo} onChange={set("tipo")}>
              <option value="">Selecione...</option>
              <option>Construção nova</option>
              <option>Reforma parcial</option>
              <option>Reforma completa</option>
              <option>Interiores (sem obra estrutural)</option>
            </Select>
          </FormGroup>
          <FormGroup label="Ambientes para especificar" required full>
            <Textarea
              placeholder="Ex: sala de estar, sala de jantar, cozinha, 2 quartos, suíte master, 2 banheiros, área de serviço"
              value={f.ambientes}
              onChange={set("ambientes")}
            />
          </FormGroup>
          <FormGroup label="Preferências de materiais / restrições" full>
            <Textarea
              placeholder="Ex: prefere porcelanato a cerâmica, sem PVC visível, madeira apenas em marcenaria..."
              value={f.materiais}
              onChange={set("materiais")}
            />
          </FormGroup>
          <FormGroup label="Restrições de normas / condicionantes" full>
            <Textarea
              placeholder="Ex: ABNT NBR 9050 (acessibilidade), restrições do condomínio..."
              value={f.normas}
              onChange={set("normas")}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <TemplateRenderer text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
