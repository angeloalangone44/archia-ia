"use client";

import DocumentForm, {
  FormGrid, FormGroup, Input, Select, Textarea, SectionDivider,
} from "@/components/DocumentForm";
import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useState } from "react";

export default function PropostaPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState({
    cliente: "", tipo: "", escopo: "",
    valor: "", pagto: "", prazo: "", validade: "", exclusoes: "", diferencial: "",
    // identidade do escritório
    nomeEscritorio: "", tomComunicacao: "", diferenciais: "", fraseApresentacao: "",
  });

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

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
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Proposta Comercial</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Informe escopo, honorários e a identidade do escritório — a IA gera uma proposta no seu tom
        </p>
      </div>

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar proposta comercial">
        <FormGrid>
          {/* identidade primeiro — define o tom antes de tudo */}
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
        </FormGrid>
      </DocumentForm>

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
