"use client";

import { useEffect, useRef, useState } from "react";
import { getStages, saveStages, type Stage, type StageState } from "@/lib/stages";

const GREEN  = "#2D5A3D";
const AMBER  = "#D97706";
const GRAY   = "#C8C0B4";

/* ── helpers ─────────────────────────────────────────────── */

function stateColor(s: Stage): string {
  return s.estado === "concluida" ? GREEN : s.estado === "em_andamento" ? AMBER : GRAY;
}

function nextState(current: StageState): StageState {
  return current === "pendente" ? "em_andamento"
       : current === "em_andamento" ? "concluida"
       : "pendente";
}

/* ── StateCircle ─────────────────────────────────────────── */

function StateCircle({ stage, onClick }: { stage: Stage; onClick: () => void }) {
  const color = stateColor(stage);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={`Clique para mudar estado (${stage.estado})`}
      style={{
        width: 26, height: 26, borderRadius: "50%",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: stage.estado === "pendente" ? "var(--surface)" : color,
        border: stage.estado === "pendente" ? `2px solid ${GRAY}` : "none",
        cursor: "pointer", transition: "all 0.18s",
      }}
    >
      {stage.estado === "concluida" && (
        <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {stage.estado === "em_andamento" && (
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />
      )}
    </button>
  );
}

/* ── EditableName ────────────────────────────────────────── */

function EditableName({ stage, onSave, color }: { stage: Stage; onSave: (nome: string) => void; color: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(stage.nome);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = val.trim() || stage.nome;
    setVal(trimmed);
    onSave(trimmed);
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(stage.nome); setEditing(false); } }}
        style={{
          fontSize: 10, textAlign: "center", border: "none", outline: "none",
          background: "transparent", color, width: "100%", fontFamily: "'DM Sans', sans-serif",
          borderBottom: `1px solid ${color}`,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Clique para editar o nome"
      style={{
        fontSize: 10, color, textAlign: "center", lineHeight: 1.3,
        background: "none", border: "none", cursor: "text",
        fontFamily: "'DM Sans', sans-serif", width: "100%",
        wordBreak: "break-word",
      }}
    >
      {stage.nome}
    </button>
  );
}

/* ── StageTracker ────────────────────────────────────────── */

export default function StageTracker({ projetoId }: { projetoId: string }) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setStages(getStages(projetoId));
  }, [projetoId]);

  function save(updated: Stage[]) {
    setStages(updated);
    saveStages(projetoId, updated);
  }

  function cycleState(id: string) {
    save(
      stages.map((s) => {
        if (s.id === id) {
          const next = nextState(s.estado);
          const concluidaEm = next === "concluida" && !s.concluidaEm
            ? new Date().toISOString().split("T")[0]
            : s.concluidaEm;
          return { ...s, estado: next, concluidaEm };
        }
        // Only one em_andamento at a time
        if (nextState(stages.find(x => x.id === id)!.estado) === "em_andamento" && s.estado === "em_andamento") {
          return { ...s, estado: "pendente" as StageState };
        }
        return s;
      })
    );
  }

  function updateField(id: string, field: keyof Stage, value: string) {
    save(stages.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  const selected = stages.find((s) => s.id === selectedId) ?? null;
  const concluidas = stages.filter((s) => s.estado === "concluida").length;
  const pct = stages.length > 0 ? (concluidas / stages.length) * 100 : 0;

  if (stages.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--ink3)" }}>
          Acompanhamento
        </p>
        <span className="text-[11px]" style={{ color: "var(--ink3)" }}>
          {concluidas}/{stages.length} concluídas
          {stages.find(s => s.estado === "em_andamento") && ` · Em andamento: ${stages.find(s => s.estado === "em_andamento")!.nome}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="rounded-full mb-5 overflow-hidden" style={{ height: 4, background: "var(--border)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: GREEN, transition: "width 0.3s" }} />
      </div>

      {/* Horizontal timeline — scrollable on small screens */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", minWidth: stages.length * 72 }}>
          {stages.map((stage, i) => {
            const color = stateColor(stage);
            const isSelected = selectedId === stage.id;
            const prevConcluida = i > 0 && stages[i - 1].estado === "concluida";
            const selfConcluida = stage.estado === "concluida";

            return (
              <div key={stage.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Connector + circle row */}
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {/* Left connector */}
                  {i > 0 && (
                    <div style={{ flex: 1, height: 2, background: prevConcluida ? GREEN : "var(--border)", transition: "background 0.3s" }} />
                  )}

                  {/* Circle */}
                  <div style={{ position: "relative" }}>
                    <StateCircle stage={stage} onClick={() => cycleState(stage.id)} />
                    {isSelected && (
                      <div style={{
                        position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                        width: 4, height: 4, borderRadius: "50%", background: color,
                      }} />
                    )}
                  </div>

                  {/* Right connector */}
                  {i < stages.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: selfConcluida ? GREEN : "var(--border)", transition: "background 0.3s" }} />
                  )}
                </div>

                {/* Name below circle */}
                <div
                  style={{ marginTop: 8, width: "100%", paddingInline: 4, cursor: "pointer" }}
                  onClick={() => setSelectedId(isSelected ? null : stage.id)}
                >
                  <EditableName
                    stage={stage}
                    color={isSelected ? color : "var(--ink3)"}
                    onSave={(nome) => updateField(stage.id, "nome", nome)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel for selected stage */}
      {selected && (
        <div
          className="mt-4 rounded-xl p-4"
          style={{ background: "var(--surface2)", border: `0.5px solid ${stateColor(selected)}40` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium" style={{ color: stateColor(selected) }}>
              {selected.nome}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${stateColor(selected)}18`, color: stateColor(selected) }}>
                {selected.estado === "pendente" ? "Pendente" : selected.estado === "em_andamento" ? "Em andamento" : "Concluída"}
              </span>
              <button
                onClick={() => cycleState(selected.id)}
                className="text-[11px] px-2.5 py-1 rounded-lg"
                style={{ background: stateColor(selected), color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Avançar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--ink3)" }}>Prazo</label>
              <input
                type="date"
                value={selected.prazo}
                onChange={(e) => updateField(selected.id, "prazo", e.target.value)}
                style={{
                  width: "100%", fontSize: 12, padding: "5px 8px", borderRadius: 6,
                  border: "0.5px solid var(--border-strong)", background: "var(--surface)",
                  color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none",
                }}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--ink3)" }}>Concluída em</label>
              <input
                type="date"
                value={selected.concluidaEm}
                onChange={(e) => updateField(selected.id, "concluidaEm", e.target.value)}
                style={{
                  width: "100%", fontSize: 12, padding: "5px 8px", borderRadius: 6,
                  border: "0.5px solid var(--border-strong)", background: "var(--surface)",
                  color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none",
                }}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "var(--ink3)" }}>Observação</label>
            <textarea
              value={selected.obs}
              onChange={(e) => updateField(selected.id, "obs", e.target.value)}
              placeholder="Ex: cliente pediu 2 opções de layout..."
              rows={2}
              style={{
                width: "100%", fontSize: 12, padding: "6px 8px", borderRadius: 6,
                border: "0.5px solid var(--border-strong)", background: "var(--surface)",
                color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
