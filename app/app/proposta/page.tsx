"use client";

import DocumentForm, {
  FormGrid,
  FormGroup,
  Input,
  Select,
  Textarea,
  SectionDivider,
} from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useState } from "react";

export default function PropostaPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState({
    cliente: "", tipo: "", escopo: "",
    valor: "", pagto: "", prazo: "",
    validade: "", exclusoes: "", diferencial: "",
  });

  const set = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSubmit() {
    if (!f.cliente || !f.escopo || !f.valor) {
      alert("Preencha os campos obrigatórios: cliente, escopo e honorários.");
      return;
    }
    generate("proposta", f, f.cliente);
  }

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Proposta Comercial
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Informe escopo e honorários — a IA gera proposta formatada
        </p>
      </div>

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar proposta comercial">
        <FormGrid>
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
              placeholder="Ex: estudo preliminar, anteprojeto, projeto legal, projeto executivo (arq + hidro + elétrico), acompanhamento de obra"
              value={f.escopo}
              onChange={set("escopo")}
            />
          </FormGroup>

          <SectionDivider>Honorários</SectionDivider>

          <FormGroup label="Valor total dos honorários (R$)" required>
            <Input placeholder="Ex: R$ 45.000" value={f.valor} onChange={set("valor")} />
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
          <FormGroup label="O que não está incluído (exclusões de escopo)" full>
            <Textarea
              placeholder="Ex: projetos complementares (estrutural, paisagismo), aprovação em órgãos, taxas de prefeitura..."
              value={f.exclusoes}
              onChange={set("exclusoes")}
            />
          </FormGroup>
          <FormGroup label="Diferencial / argumento de valor" full>
            <Textarea
              placeholder="Ex: experiência em projetos similares, uso de BIM, entregas em prazo..."
              value={f.diferencial}
              onChange={set("diferencial")}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
