"use client";

import StreamingOutput from "@/components/StreamingOutput";
import { useGenerate } from "@/lib/useGenerate";
import { useState } from "react";
import { Input, Select, Textarea, FormGroup } from "@/components/DocumentForm";

/* ── constantes ─────────────────────────────────────────── */

const TIPOS_PROJETO = [
  { id: "residencial-casa",  label: "Residencial", sub: "Casa" },
  { id: "residencial-apto",  label: "Residencial", sub: "Apartamento" },
  { id: "comercial",         label: "Comercial",   sub: "Escritório / loja" },
  { id: "reforma",           label: "Reforma",     sub: "Parcial ou completa" },
  { id: "interiores",        label: "Interiores",  sub: "Sem obra estrutural" },
];

const ROOMS = [
  { id: "sala",         label: "Sala de estar / jantar" },
  { id: "cozinha",      label: "Cozinha" },
  { id: "quarto-casal", label: "Quarto casal" },
  { id: "quarto-kids",  label: "Quarto kids" },
  { id: "banheiro",     label: "Banheiro" },
  { id: "lavabo",       label: "Lavabo" },
  { id: "closet",       label: "Closet" },
  { id: "area-servico", label: "Área de serviço" },
  { id: "varanda",      label: "Varanda / área gourmet" },
  { id: "home-office",  label: "Home office" },
];

const ROOM_ITEMS: Record<string, string[]> = {
  "sala":         ["Painel de TV", "Lareira", "Bancada / bar", "Mesa extensível", "Adega", "Sofá em L"],
  "cozinha":      ["Ilha / bancada", "Cooktop a gás", "Cooktop por indução", "Forno embutido", "Geladeira side-by-side", "Despensa", "Bancada extra"],
  "quarto-casal": ["Cabeceira painel", "Closet integrado", "Bancada maquiagem", "TV painel", "Escritório integrado", "Sacada"],
  "quarto-kids":  ["Beliche", "Escrivaninha", "Armário planejado", "Cantinho leitura", "Quadro lousa"],
  "banheiro":     ["Banheira", "Box amplo", "Ducha higiênica", "Cuba dupla", "Nicho embutido", "Aquecedor de toalha"],
  "lavabo":       ["Cuba de apoio", "Espelho iluminado", "Papel de parede", "Torneira de design"],
  "closet":       ["Ilha central", "Cabideiro duplo", "Gavetas", "Espelho corpo inteiro", "Penteadeira", "Sapateira"],
  "area-servico": ["Tanque", "Armário de limpeza", "Varal embutido", "Espaço para máquinas", "Bancada"],
  "varanda":      ["Churrasqueira", "Bancada / pia", "TV externa", "Forno de pizza", "Adega", "Pergolado", "Jardim vertical"],
  "home-office":  ["Mesa em L", "Parede de livros", "Quadro branco", "Armário arquivo", "Bancada reunião", "Iluminação técnica"],
};

/* ── tipos ──────────────────────────────────────────────── */

type RoomFields = {
  estilo: string;
  paredeRevestimento: string;
  pisoRevestimento: string;
  iluminacao: string;
  madeira: string;
  itens: string[];
  aproveitarMoveis: string;
  obs: string;
};

const emptyRoom = (): RoomFields => ({
  estilo: "", paredeRevestimento: "", pisoRevestimento: "",
  iluminacao: "", madeira: "", itens: [], aproveitarMoveis: "", obs: "",
});

type Step1 = {
  tipoDetalhado: string;
  cliente: string;
  local: string;
  area: string;
  orcamento: string;
  prazo: string;
  moradores: string;
  pet: string;
  obsGerais: string;
};

/* ── componente de linha de campo ───────────────────────── */

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <span className="text-[12px] w-40 flex-shrink-0 pt-2.5" style={{ color: "var(--ink3)" }}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ── form de um ambiente ────────────────────────────────── */

function RoomForm({
  roomId,
  roomLabel,
  data,
  onChange,
}: {
  roomId: string;
  roomLabel: string;
  data: RoomFields;
  onChange: (updated: RoomFields) => void;
}) {
  const [open, setOpen] = useState(true);
  const items = ROOM_ITEMS[roomId] ?? [];

  function toggleItem(item: string) {
    const current = data.itens;
    onChange({
      ...data,
      itens: current.includes(item) ? current.filter((i) => i !== item) : [...current, item],
    });
  }

  const set = (k: keyof RoomFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [k]: e.target.value });

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}
    >
      {/* header do ambiente */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:opacity-80"
        style={{ background: "var(--surface2)" }}
      >
        <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{roomLabel}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-4 h-4 transition-transform"
          style={{
            color: "var(--ink3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4">
          <FieldRow label="Estilo preferido">
            <Select value={data.estilo} onChange={set("estilo")}>
              <option value="">—</option>
              <option>Clean / minimalista</option>
              <option>Clássico / sofisticado</option>
              <option>Moderno contemporâneo</option>
              <option>Rústico / orgânico</option>
              <option>Industrial</option>
            </Select>
          </FieldRow>

          <FieldRow label="Revestimento de parede">
            <Input placeholder="Ex: cimento queimado, azulejo artesanal, tinta branca..." value={data.paredeRevestimento} onChange={set("paredeRevestimento")} />
          </FieldRow>

          <FieldRow label="Revestimento de piso">
            <Input placeholder="Ex: porcelanato 120×120, vinílico, madeira..." value={data.pisoRevestimento} onChange={set("pisoRevestimento")} />
          </FieldRow>

          <FieldRow label="Iluminação">
            <Select value={data.iluminacao} onChange={set("iluminacao")}>
              <option value="">—</option>
              <option>Direta (sem rebaixo)</option>
              <option>Indireta com rebaixo</option>
              <option>Mista — direta e indireta</option>
              <option>Sem preferência</option>
            </Select>
          </FieldRow>

          <FieldRow label="Tom de madeira">
            <Select value={data.madeira} onChange={set("madeira")}>
              <option value="">—</option>
              <option>Clara (freijó, carvalho claro)</option>
              <option>Média (nogueira, tauari)</option>
              <option>Escura (wengué, imbuia)</option>
              <option>Sem madeira</option>
            </Select>
          </FieldRow>

          {items.length > 0 && (
            <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
              <p className="text-[12px] mb-2.5" style={{ color: "var(--ink3)" }}>Itens desejados</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const checked = data.itens.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className="text-[12px] px-3 py-1 rounded-full transition-colors"
                      style={{
                        background: checked ? "var(--accent)" : "var(--surface2)",
                        color: checked ? "#fff" : "var(--ink2)",
                        border: checked ? "0.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      {checked ? "✓ " : ""}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <FieldRow label="Aproveitar móveis?">
            <Select value={data.aproveitarMoveis} onChange={set("aproveitarMoveis")}>
              <option value="">—</option>
              <option>Sim — cliente tem móveis para reaproveitar</option>
              <option>Não — ambiente 100% novo</option>
              <option>Parcialmente</option>
            </Select>
          </FieldRow>

          <FieldRow label="Observações livres">
            <Textarea placeholder="Detalhes específicos deste ambiente..." value={data.obs} onChange={set("obs")} style={{ minHeight: 60 }} />
          </FieldRow>
        </div>
      )}
    </div>
  );
}

/* ── stepper UI ─────────────────────────────────────────── */

function Stepper({ step }: { step: number }) {
  const steps = ["Projeto", "Ambientes", "Detalhes"];
  return (
    <div className="flex items-center gap-2 mb-7">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium"
                style={{
                  background: done ? "var(--accent)" : active ? "var(--ink)" : "var(--surface2)",
                  color: done || active ? "#fff" : "var(--ink3)",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span
                className="text-[12px]"
                style={{ color: active ? "var(--ink)" : "var(--ink3)", fontWeight: active ? 500 : 400 }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-px mx-1" style={{ background: "var(--border-strong)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── página principal ───────────────────────────────────── */

export default function BriefingPage() {
  const { text, isLoading, visible, generate } = useGenerate();
  const [step, setStep] = useState(1);

  const [s1, setS1] = useState<Step1>({
    tipoDetalhado: "", cliente: "", local: "", area: "",
    orcamento: "", prazo: "", moradores: "", pet: "", obsGerais: "",
  });
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [roomData, setRoomData] = useState<Record<string, RoomFields>>({});

  const setS1Field = (k: keyof Step1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setS1((prev) => ({ ...prev, [k]: e.target.value }));

  function toggleRoom(id: string) {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    if (!roomData[id]) setRoomData((prev) => ({ ...prev, [id]: emptyRoom() }));
  }

  function serializeRooms(): string {
    return selectedRooms
      .map((id) => {
        const label = ROOMS.find((r) => r.id === id)?.label ?? id;
        const d = roomData[id] ?? emptyRoom();
        const lines = [
          `[${label.toUpperCase()}]`,
          d.estilo            && `• Estilo: ${d.estilo}`,
          d.paredeRevestimento && `• Revestimento de parede: ${d.paredeRevestimento}`,
          d.pisoRevestimento   && `• Revestimento de piso: ${d.pisoRevestimento}`,
          d.iluminacao         && `• Iluminação: ${d.iluminacao}`,
          d.madeira            && `• Tom de madeira: ${d.madeira}`,
          d.itens.length > 0   && `• Itens desejados: ${d.itens.join(", ")}`,
          d.aproveitarMoveis   && `• Aproveitar móveis: ${d.aproveitarMoveis}`,
          d.obs                && `• Observações: ${d.obs}`,
        ].filter(Boolean);
        return lines.join("\n");
      })
      .join("\n\n");
  }

  function handleGenerate() {
    if (selectedRooms.length === 0) {
      alert("Selecione pelo menos um ambiente.");
      return;
    }
    const dados = { ...s1, ambientesDetalhados: serializeRooms() };
    generate("briefing", dados, s1.cliente || "Briefing");
  }

  const btnStyle = {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  } as React.CSSProperties;

  const btnSecStyle = {
    ...btnStyle,
    background: "transparent",
    color: "var(--ink2)",
    border: "0.5px solid var(--border-strong)",
  } as React.CSSProperties;

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Briefing técnico</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Preencha por ambiente — a IA gera o briefing em formato de checklist
        </p>
      </div>

      <Stepper step={step} />

      {/* ── PASSO 1: Tipo + dados gerais ─────────────────── */}
      {step === 1 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>
            Tipo de projeto
          </p>
          <div className="grid grid-cols-5 gap-2 mb-7">
            {TIPOS_PROJETO.map((t) => {
              const active = s1.tipoDetalhado === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setS1((prev) => ({ ...prev, tipoDetalhado: t.id }))}
                  className="flex flex-col items-center text-center p-3 rounded-xl transition-all"
                  style={{
                    border: active ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                    background: active ? "var(--accent-light)" : "var(--surface)",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span className="text-[12px] font-medium" style={{ color: active ? "var(--accent)" : "var(--ink)" }}>
                    {t.label}
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: active ? "var(--accent)" : "var(--ink3)" }}>
                    {t.sub}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Nome do cliente" required>
              <Input placeholder="Ex: Maria Fernanda Costa" value={s1.cliente} onChange={setS1Field("cliente")} />
            </FormGroup>
            <FormGroup label="Localização">
              <Input placeholder="Ex: Pinheiros, SP" value={s1.local} onChange={setS1Field("local")} />
            </FormGroup>
            <FormGroup label="Área estimada">
              <Input placeholder="Ex: 120 m²" value={s1.area} onChange={setS1Field("area")} />
            </FormGroup>
            <FormGroup label="Orçamento disponível">
              <Select value={s1.orcamento} onChange={setS1Field("orcamento")}>
                <option value="">Selecione uma faixa...</option>
                <option>Até R$ 100.000</option>
                <option>R$ 100.000 – R$ 300.000</option>
                <option>R$ 300.000 – R$ 500.000</option>
                <option>Acima de R$ 500.000</option>
                <option>Não informado</option>
              </Select>
            </FormGroup>
            <FormGroup label="Prazo desejado">
              <Input placeholder="Ex: 8 meses" value={s1.prazo} onChange={setS1Field("prazo")} />
            </FormGroup>
            <FormGroup label="Moradores">
              <Input placeholder="Ex: casal + 2 filhos" value={s1.moradores} onChange={setS1Field("moradores")} />
            </FormGroup>
            <FormGroup label="Pet na residência?">
              <Select value={s1.pet} onChange={setS1Field("pet")}>
                <option value="">—</option>
                <option>Sim</option>
                <option>Não</option>
              </Select>
            </FormGroup>
            <FormGroup label="Observações gerais">
              <Input placeholder="Ex: segunda residência, necessidades especiais..." value={s1.obsGerais} onChange={setS1Field("obsGerais")} />
            </FormGroup>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              style={btnStyle}
              onClick={() => {
                if (!s1.tipoDetalhado || !s1.cliente) {
                  alert("Selecione o tipo de projeto e informe o nome do cliente.");
                  return;
                }
                setStep(2);
              }}
            >
              Selecionar ambientes →
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 2: Seleção de ambientes ───────────────── */}
      {step === 2 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>
            Quais ambientes fazem parte do projeto?
          </p>
          <div className="grid grid-cols-2 gap-2 mb-7">
            {ROOMS.map((room) => {
              const checked = selectedRooms.includes(room.id);
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    border: checked ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                    background: checked ? "var(--accent-light)" : "var(--surface)",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: checked ? "var(--accent)" : "transparent",
                      border: checked ? "none" : "1.5px solid var(--border-strong)",
                    }}
                  >
                    {checked && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>}
                  </div>
                  <span className="text-[13px]" style={{ color: checked ? "var(--accent)" : "var(--ink2)", fontWeight: checked ? 500 : 400 }}>
                    {room.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRooms.length > 0 && (
            <p className="text-xs mb-4" style={{ color: "var(--ink3)" }}>
              {selectedRooms.length} {selectedRooms.length === 1 ? "ambiente selecionado" : "ambientes selecionados"}
            </p>
          )}

          <div className="flex justify-between">
            <button style={btnSecStyle} onClick={() => setStep(1)}>← Voltar</button>
            <button
              style={btnStyle}
              onClick={() => {
                if (selectedRooms.length === 0) { alert("Selecione pelo menos um ambiente."); return; }
                setStep(3);
              }}
            >
              Preencher detalhes →
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 3: Detalhes por ambiente ──────────────── */}
      {step === 3 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>
            Detalhes por ambiente
          </p>

          {selectedRooms.map((id) => {
            const room = ROOMS.find((r) => r.id === id);
            return (
              <RoomForm
                key={id}
                roomId={id}
                roomLabel={room?.label ?? id}
                data={roomData[id] ?? emptyRoom()}
                onChange={(updated) => setRoomData((prev) => ({ ...prev, [id]: updated }))}
              />
            );
          })}

          <div className="flex items-center justify-between mt-6">
            <button style={btnSecStyle} onClick={() => setStep(2)}>← Ambientes</button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{ ...btnStyle, opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Gerar briefing
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <StreamingOutput text={text} isStreaming={isLoading} visible={visible} />
    </div>
  );
}
