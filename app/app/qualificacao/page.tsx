"use client";

import DocumentForm, { FormGrid, FormGroup, Input, Select, Textarea } from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useState } from "react";

export default function QualificacaoPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState({
    nome: "",
    tipoProjetoQual: "",
    metragem: "",
    orcamentoFaixa: "",
    prazo: "",
    cidade: "",
    comoConheceu: "",
    descricao: "",
  });

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSubmit() {
    if (!f.nome || !f.tipoProjetoQual || !f.descricao) {
      alert("Preencha pelo menos: nome, tipo de projeto e descrição.");
      return;
    }
    generate("qualificacao", f, f.nome);
  }

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Qualificação de cliente
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Enviado pelo cliente antes da primeira reunião — a IA gera seu relatório de qualificação
        </p>
      </div>

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar relatório de qualificação">
        <FormGrid>
          <FormGroup label="Nome completo" required>
            <Input placeholder="Ex: Ana Paula Ferreira" value={f.nome} onChange={set("nome")} />
          </FormGroup>

          <FormGroup label="Tipo de projeto" required>
            <Select value={f.tipoProjetoQual} onChange={set("tipoProjetoQual")}>
              <option value="">Selecione...</option>
              <option>Residencial</option>
              <option>Comercial</option>
              <option>Reforma</option>
              <option>Interiores</option>
            </Select>
          </FormGroup>

          <FormGroup label="Metragem estimada">
            <Input placeholder="Ex: 120 m²" value={f.metragem} onChange={set("metragem")} />
          </FormGroup>

          <FormGroup label="Orçamento disponível">
            <Select value={f.orcamentoFaixa} onChange={set("orcamentoFaixa")}>
              <option value="">Selecione uma faixa...</option>
              <option>Até R$ 100.000</option>
              <option>R$ 100.000 – R$ 300.000</option>
              <option>R$ 300.000 – R$ 500.000</option>
              <option>Acima de R$ 500.000</option>
            </Select>
          </FormGroup>

          <FormGroup label="Prazo desejado">
            <Input placeholder="Ex: 8 meses, início em março" value={f.prazo} onChange={set("prazo")} />
          </FormGroup>

          <FormGroup label="Cidade / bairro">
            <Input placeholder="Ex: Moema, São Paulo" value={f.cidade} onChange={set("cidade")} />
          </FormGroup>

          <FormGroup label="Como conheceu o arquiteto" full>
            <Input placeholder="Ex: indicação de amigo, Instagram, Google..." value={f.comoConheceu} onChange={set("comoConheceu")} />
          </FormGroup>

          <FormGroup label="Descreva em poucas linhas o que você está buscando" required full>
            <Textarea
              placeholder="Ex: quero reformar meu apartamento de 90m² no Brooklin. Busco um ambiente mais integrado, com personalidade, sem ser excessivamente formal. Tenho 2 filhos pequenos e um cachorro..."
              value={f.descricao}
              onChange={set("descricao")}
              style={{ minHeight: 100 }}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
