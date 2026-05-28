"use client";

import DocumentForm, {
  FormGrid,
  FormGroup,
  Select,
  Textarea,
  Input,
} from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useState } from "react";

export default function SpecsPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState({
    projeto: "", padrao: "", tipo: "",
    ambientes: "", materiais: "", normas: "",
  });

  const set = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSubmit() {
    if (!f.projeto || !f.padrao || !f.ambientes) {
      alert("Preencha os campos obrigatórios: nome do projeto, padrão e ambientes.");
      return;
    }
    generate("specs", f, f.projeto);
  }

  const warning = (
    <div
      className="rounded-[10px] px-4 py-3 text-xs leading-relaxed"
      style={{
        background: "var(--gold-light)",
        border: "0.5px solid rgba(139,105,20,0.2)",
        color: "#6B4C10",
      }}
    >
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

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
