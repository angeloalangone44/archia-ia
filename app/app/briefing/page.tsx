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

const TIPOS = [
  "Residencial — casa",
  "Residencial — apartamento",
  "Comercial — escritório",
  "Comercial — loja / varejo",
  "Reforma / retrofit",
  "Interiores",
  "Outro",
];

export default function BriefingPage() {
  const { text, isLoading, visible, generate } = useGenerate();

  const [f, setF] = useState({
    cliente: "", tipo: "", area: "", local: "",
    orcamento: "", prazo: "", moradores: "", pet: "",
    ambientes: "", estilo: "", restricoes: "", obs: "",
  });

  const set = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSubmit() {
    if (!f.cliente || !f.tipo || !f.ambientes) {
      alert("Preencha os campos obrigatórios: cliente, tipo e ambientes.");
      return;
    }
    generate("briefing", f, f.cliente);
  }

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Gerador de Briefing Técnico
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Preencha o formulário — a IA gera o briefing padronizado
        </p>
      </div>

      <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} buttonLabel="Gerar briefing técnico">
        <FormGrid>
          <FormGroup label="Nome do cliente" required>
            <Input placeholder="Ex: Maria Fernanda Costa" value={f.cliente} onChange={set("cliente")} />
          </FormGroup>
          <FormGroup label="Tipo de projeto" required>
            <Select value={f.tipo} onChange={set("tipo")}>
              <option value="">Selecione...</option>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Área estimada (m²)">
            <Input placeholder="Ex: 120 m²" value={f.area} onChange={set("area")} />
          </FormGroup>
          <FormGroup label="Localização do imóvel">
            <Input placeholder="Ex: Pinheiros, SP" value={f.local} onChange={set("local")} />
          </FormGroup>
          <FormGroup label="Orçamento disponível (R$)">
            <Input placeholder="Ex: R$ 350.000" value={f.orcamento} onChange={set("orcamento")} />
          </FormGroup>
          <FormGroup label="Prazo desejado">
            <Input placeholder="Ex: 8 meses" value={f.prazo} onChange={set("prazo")} />
          </FormGroup>

          <SectionDivider>Programa de necessidades</SectionDivider>

          <FormGroup label="Ambientes desejados" required full>
            <Textarea
              placeholder="Ex: 3 quartos (1 suíte), sala integrada com cozinha, lavabo, varanda gourmet, home office"
              value={f.ambientes}
              onChange={set("ambientes")}
            />
          </FormGroup>
          <FormGroup label="Estilo / referências estéticas" full>
            <Textarea
              placeholder="Ex: moderno minimalista, madeira natural, paleta neutra..."
              value={f.estilo}
              onChange={set("estilo")}
            />
          </FormGroup>
          <FormGroup label="Moradores">
            <Input placeholder="Ex: casal + 2 filhos (7 e 12 anos)" value={f.moradores} onChange={set("moradores")} />
          </FormGroup>
          <FormGroup label="Pet na residência?">
            <Select value={f.pet} onChange={set("pet")}>
              <option value="">—</option>
              <option>Sim</option>
              <option>Não</option>
            </Select>
          </FormGroup>
          <FormGroup label="Necessidades especiais / restrições" full>
            <Textarea
              placeholder="Ex: acessibilidade, claustrofobia, alergia a materiais..."
              value={f.restricoes}
              onChange={set("restricoes")}
            />
          </FormGroup>
          <FormGroup label="Observações da reunião" full>
            <Textarea
              placeholder="Anote tudo que o cliente disse e não cabe nos campos acima..."
              value={f.obs}
              onChange={set("obs")}
            />
          </FormGroup>
        </FormGrid>
      </DocumentForm>

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
