"use client";

// NÃO CONECTAR AO MOTOR DE IA / GERAÇÃO DE ESPECIFICAÇÕES.
// Isso é intencional: existe uma decisão de produto pendente sobre
// conteúdo patrocinado e como ele seria sinalizado ao usuário final.
// Não integrar sem revisão explícita dessa decisão.

import { useEffect, useState } from "react";
import {
  getParceiros,
  saveParceiro,
  deleteParceiro,
  emptyParceiro,
  type Parceiro,
  type FaixaPreco,
} from "@/lib/parceiros";

const FAIXA_LABELS: Record<FaixaPreco, string> = {
  "": "Não informado",
  econômico: "Econômico",
  médio: "Médio padrão",
  alto: "Alto padrão",
};

/* ─── modal ─────────────────────────────────────────────── */

function ParceiroModal({
  inicial,
  onSave,
  onClose,
}: {
  inicial: Parceiro;
  onSave: (p: Parceiro) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<Parceiro>(inicial);

  function set<K extends keyof Parceiro>(k: K, v: Parceiro[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!p.nome.trim()) return alert("Informe o nome do parceiro.");
    saveParceiro(p);
    onSave(p);
  }

  const inputStyle = {
    background: "var(--surface2)",
    border: "0.5px solid var(--border)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>
            {inicial.nome ? "Editar parceiro" : "Novo parceiro"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 18 }}>×</button>
        </div>

        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Nome *</label>
        <input value={p.nome} onChange={(e) => set("nome", e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4" style={inputStyle}
          placeholder="Ex: Cerâmicas Progresso" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Categoria</label>
            <input value={p.categoria} onChange={(e) => set("categoria", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13px]" style={inputStyle}
              placeholder="Ex: Revestimentos" />
          </div>
          <div>
            <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Faixa de preço</label>
            <select value={p.faixaPreco} onChange={(e) => set("faixaPreco", e.target.value as FaixaPreco)}
              className="w-full rounded-lg px-3 py-2 text-[13px]"
              style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Não informado</option>
              <option value="econômico">Econômico</option>
              <option value="médio">Médio padrão</option>
              <option value="alto">Alto padrão</option>
            </select>
          </div>
        </div>

        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>O que fornece</label>
        <textarea value={p.fornece} onChange={(e) => set("fornece", e.target.value)}
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4"
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Ex: Porcelanatos e cerâmicas importadas, mármores, granitos..." />

        <p className="text-[11px] font-medium mb-2" style={{ color: "var(--ink2)" }}>Contato</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Nome do contato</label>
            <input value={p.contatoNome} onChange={(e) => set("contatoNome", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13px]" style={inputStyle}
              placeholder="Ex: João Silva" />
          </div>
          <div>
            <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Telefone / WhatsApp</label>
            <input value={p.contatoTel} onChange={(e) => set("contatoTel", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13px]" style={inputStyle}
              placeholder="(11) 91234-5678" />
          </div>
        </div>

        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>E-mail</label>
        <input value={p.contatoEmail} onChange={(e) => set("contatoEmail", e.target.value)}
          type="email"
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4" style={inputStyle}
          placeholder="contato@fornecedor.com.br" />

        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Observações</label>
        <textarea value={p.obs} onChange={(e) => set("obs", e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-5"
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Desconto para arquitetos, prazo de entrega, etc." />

        <div className="flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px]"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded-lg text-[13px] text-white"
            style={{ background: "var(--gold)", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── card ───────────────────────────────────────────────── */

function ParceiroCard({
  p,
  onEdit,
  onDelete,
}: {
  p: Parceiro;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl p-4"
      style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>{p.nome}</p>
        {p.faixaPreco && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}>
            {FAIXA_LABELS[p.faixaPreco]}
          </span>
        )}
      </div>
      {p.categoria && <p className="text-[11px] mb-1" style={{ color: "var(--ink3)" }}>{p.categoria}</p>}
      {p.fornece && <p className="text-[12px] mb-2 line-clamp-2" style={{ color: "var(--ink2)" }}>{p.fornece}</p>}

      {(p.contatoNome || p.contatoTel || p.contatoEmail) && (
        <div className="rounded-lg px-3 py-2 mb-2" style={{ background: "var(--surface2)" }}>
          {p.contatoNome && <p className="text-[11px]" style={{ color: "var(--ink2)" }}>{p.contatoNome}</p>}
          {p.contatoTel && <p className="text-[11px]" style={{ color: "var(--ink3)" }}>{p.contatoTel}</p>}
          {p.contatoEmail && <p className="text-[11px]" style={{ color: "var(--ink3)" }}>{p.contatoEmail}</p>}
        </div>
      )}

      {p.obs && <p className="text-[11px] mb-3 line-clamp-2" style={{ color: "var(--ink3)" }}>{p.obs}</p>}

      <div className="flex gap-2">
        <button onClick={onEdit}
          className="text-[11px] px-2 py-1 rounded-lg"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          Editar
        </button>
        <button onClick={onDelete}
          className="text-[11px] px-2 py-1 rounded-lg"
          style={{ background: "none", border: "0.5px solid var(--border)", color: "#C0392B", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          Excluir
        </button>
      </div>
    </div>
  );
}

/* ─── página ─────────────────────────────────────────────── */

export default function ParceirosPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [modal, setModal] = useState<Parceiro | null>(null);
  const [filterCat, setFilterCat] = useState("");

  function load() { setParceiros(getParceiros()); }
  useEffect(load, []);

  function handleSave() { setModal(null); load(); }
  function handleDelete(id: string) {
    if (!confirm("Excluir este parceiro?")) return;
    deleteParceiro(id);
    load();
  }

  const categorias = Array.from(new Set(parceiros.map((p) => p.categoria).filter(Boolean))).sort();
  const filtered = filterCat ? parceiros.filter((p) => p.categoria === filterCat) : parceiros;

  return (
    <div className="p-7 max-w-4xl">
      {modal && (
        <ParceiroModal inicial={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Parceiros / Fornecedores</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Agenda pessoal de fornecedores de confiança
          </p>
        </div>
        <button
          onClick={() => setModal(emptyParceiro())}
          className="px-4 py-2 rounded-xl text-[13px] text-white"
          style={{ background: "var(--gold)", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          + Novo parceiro
        </button>
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setFilterCat("")}
            className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: filterCat === "" ? "var(--gold)" : "var(--surface2)", color: filterCat === "" ? "#fff" : "var(--ink2)", border: "0.5px solid var(--border)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Todos
          </button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              className="px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: filterCat === c ? "var(--gold)" : "var(--surface2)", color: filterCat === c ? "#fff" : "var(--ink2)", border: "0.5px solid var(--border)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {parceiros.length === 0 && (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface2)", border: "1px dashed var(--border)" }}>
          <p className="text-[13px] mb-1" style={{ color: "var(--ink2)" }}>Nenhum parceiro cadastrado</p>
          <p className="text-[11px]" style={{ color: "var(--ink3)" }}>
            Cadastre fornecedores de confiança para consultar rapidamente durante os projetos.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((p) => (
          <ParceiroCard
            key={p.id}
            p={p}
            onEdit={() => setModal(p)}
            onDelete={() => handleDelete(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
