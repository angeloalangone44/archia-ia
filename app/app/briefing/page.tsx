"use client";

import TemplateRenderer from "@/components/TemplateRenderer";
import { useGenerate } from "@/lib/useGenerate";
import { useEffect, useState } from "react";
import { Input, Select, Textarea, FormGroup, SectionDivider } from "@/components/DocumentForm";
import {
  getArchiaProjects,
  saveArchiaProject,
  getArchiaProjectById,
  emptyAmbiente,
  type AmbienteData,
  type ArchiaProjetoUnificado,
} from "@/lib/archia-project";

/* ── constantes ─────────────────────────────────────────── */

const TIPOS_PROJETO = [
  { id: "residencial-casa",  label: "Residencial", sub: "Casa" },
  { id: "residencial-apto",  label: "Residencial", sub: "Apartamento" },
  { id: "comercial",         label: "Comercial",   sub: "Escritório / loja" },
  { id: "reforma",           label: "Reforma",     sub: "Parcial ou completa" },
  { id: "interiores",        label: "Interiores",  sub: "Sem obra bruta" },
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
  "cozinha":      ["Forno embutido", "Geladeira side-by-side", "Despensa", "Bancada extra"],
  "quarto-casal": ["Cabeceira painel", "Closet integrado", "Bancada maquiagem", "TV painel", "Escritório integrado", "Sacada"],
  "quarto-kids":  ["Beliche", "Escrivaninha", "Armário planejado", "Cantinho leitura", "Quadro lousa"],
  "banheiro":     ["Banheira", "Box amplo", "Nicho embutido", "Aquecedor de toalha"],
  "lavabo":       ["Espelho iluminado", "Papel de parede"],
  "closet":       ["Ilha central", "Cabideiro duplo", "Gavetas", "Espelho corpo inteiro", "Penteadeira", "Sapateira"],
  "area-servico": ["Tanque", "Armário de limpeza", "Varal embutido", "Espaço para máquinas", "Bancada"],
  "varanda":      ["TV externa", "Forno de pizza", "Adega", "Jardim vertical"],
  "home-office":  ["Mesa em L", "Parede de livros", "Quadro branco", "Armário arquivo", "Bancada reunião", "Iluminação técnica"],
};

const BRIEFING_MODEL_KEY = "archia-modelo-briefing";

/* ── tipos ──────────────────────────────────────────────── */

type RoomFields = AmbienteData;

const emptyRoom = (): RoomFields => emptyAmbiente();

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
  modeloBriefing: string;
  tomNeutro: string;
  corQueGosta: string;
  corQueNaoQuer: string;
  referenciasVisuais: string[];
};

/* ── campo de múltiplos links ───────────────────────────── */

function MultiLinkField({
  links,
  onChange,
}: {
  links: string[];
  onChange: (links: string[]) => void;
}) {
  const MAX = 10;
  const list = links.length > 0 ? links : [""];

  function setLink(i: number, val: string) {
    const next = [...list];
    next[i] = val;
    onChange(next);
  }

  function addLink() {
    if (list.length >= MAX) return;
    onChange([...list, ""]);
  }

  function removeLink(i: number) {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length > 0 ? next : [""]);
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {list.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(i, e.target.value)}
              placeholder="Ex: link do Pinterest, Instagram, Google Drive..."
              className="flex-1 text-[13px] px-3 py-2 rounded-lg"
              style={{
                border: "0.5px solid var(--border-strong)",
                background: "var(--surface2)",
                color: "var(--ink)",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {list.length < MAX && (
        <button
          type="button"
          onClick={addLink}
          className="mt-2 text-[12px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: "var(--surface2)",
            border: "0.5px solid var(--border-strong)",
            color: "var(--ink2)",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar link
        </button>
      )}
      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--ink3)" }}>
        Cole links de imagens, painéis do Pinterest ou pastas do Drive com referências que inspiram
        o projeto — seu arquiteto vai usar para entender seu estilo.
      </p>
    </div>
  );
}

/* ── campo de linha ─────────────────────────────────────── */

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <span className="text-[12px] w-44 flex-shrink-0 pt-2.5" style={{ color: "var(--ink3)" }}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ── radio simples ──────────────────────────────────────── */

function RadioRow({
  label, name, value, onChange, options
}: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>{label}</p>
      <div className="flex gap-5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
            style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
            <input type="radio" name={name} value={opt} checked={value === opt}
              onChange={() => onChange(opt)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── form de um ambiente ────────────────────────────────── */

function RoomForm({ roomId, roomLabel, data, onChange }: {
  roomId: string;
  roomLabel: string;
  data: RoomFields;
  onChange: (updated: RoomFields) => void;
}) {
  const [open, setOpen] = useState(true);
  const items = ROOM_ITEMS[roomId] ?? [];

  function toggleItem(item: string) {
    const current = data.itens;
    onChange({ ...data, itens: current.includes(item) ? current.filter((i) => i !== item) : [...current, item] });
  }

  const set = (k: keyof RoomFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [k]: e.target.value });

  const isBanheiro = roomId === "banheiro" || roomId === "lavabo";
  const isCozinha  = roomId === "cozinha";
  const isVaranda  = roomId === "varanda";
  const isQuarto   = roomId === "quarto-casal" || roomId === "quarto-kids";

  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
      {/* header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:opacity-80"
        style={{ background: "var(--surface2)" }}
      >
        <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{roomLabel}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 transition-transform"
          style={{ color: "var(--ink3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
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
            <Input placeholder="Ex: cimento queimado, azulejo artesanal, tinta..." value={data.paredeRevestimento} onChange={set("paredeRevestimento")} />
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

          {/* ── Quartos ─── */}
          {isQuarto && (
            <>
              <FieldRow label="Tamanho da cama">
                <Select value={data.tamanhoCama} onChange={set("tamanhoCama")}>
                  <option value="">—</option>
                  <option>Solteiro</option>
                  <option>Casal</option>
                  <option>Queen</option>
                  <option>King</option>
                  <option>Super King</option>
                  <option>Sofá-cama</option>
                  <option>Manter existente</option>
                  <option>Sem cama</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cabeceira">
                <Select value={data.tipoCabeceira} onChange={set("tipoCabeceira")}>
                  <option value="">—</option>
                  <option>Estofada</option>
                  <option>Madeira</option>
                  <option>Manter existente</option>
                </Select>
              </FieldRow>
              <RadioRow label="Bancada de estudos / trabalho?" name={`bancadaEstudos-${roomId}`}
                value={data.bancadaEstudos} onChange={(v) => onChange({ ...data, bancadaEstudos: v })}
                options={["Sim", "Não"]} />
              <RadioRow label="Penteadeira?" name={`penteadeira-${roomId}`}
                value={data.penteadeira} onChange={(v) => onChange({ ...data, penteadeira: v })}
                options={["Sim", "Não"]} />
            </>
          )}

          {/* ── Banheiro / Lavabo ─── */}
          {isBanheiro && (
            <>
              <FieldRow label="Tipo de bacia">
                <Select value={data.tipoBacia} onChange={set("tipoBacia")}>
                  <option value="">—</option>
                  <option>Com caixa acoplada</option>
                  <option>Sem caixa (acopla embutida)</option>
                  <option>Suspensa</option>
                  <option>Manter existente</option>
                </Select>
              </FieldRow>
              <FieldRow label="Cor da bacia">
                <Select value={data.corBacia} onChange={set("corBacia")}>
                  <option value="">—</option>
                  <option>Branca</option>
                  <option>Preta</option>
                  <option>Manter existente</option>
                  <option>Outro</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cuba">
                <Select value={data.tipoCuba} onChange={set("tipoCuba")}>
                  <option value="">—</option>
                  <option>Embutir</option>
                  <option>Apoio</option>
                  <option>Esculpida</option>
                  <option>Sobrepor</option>
                  <option>Semi-encaixe</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de torneira">
                <Select value={data.tipoTorneira} onChange={set("tipoTorneira")}>
                  <option value="">—</option>
                  <option>Monocomando</option>
                  <option>Duplo comando</option>
                  <option>Bica alta</option>
                  <option>Torneira de parede</option>
                  <option>Torneira de piso</option>
                </Select>
              </FieldRow>
              {roomId === "banheiro" && (
                <FieldRow label="Tipo de chuveiro">
                  <Select value={data.tipoChuveiro} onChange={set("tipoChuveiro")}>
                    <option value="">—</option>
                    <option>Chuveiro de teto</option>
                    <option>Chuveiro de parede</option>
                    <option>Sem preferência</option>
                  </Select>
                </FieldRow>
              )}
              <FieldRow label="Material da bancada">
                <Select value={data.materialBancada} onChange={set("materialBancada")}>
                  <option value="">—</option>
                  <option>Pedra natural</option>
                  <option>Pedra artificial</option>
                  <option>Corian</option>
                  <option>Porcelanato</option>
                  <option>Madeira</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de metal">
                <Select value={data.tipoMetal} onChange={set("tipoMetal")}>
                  <option value="">—</option>
                  <option>Cromado</option>
                  <option>Preto</option>
                  <option>Dourado</option>
                  <option>Bronze</option>
                  <option>Rose gold</option>
                </Select>
              </FieldRow>
            </>
          )}

          {/* ── Cozinha ─── */}
          {isCozinha && (
            <>
              <FieldRow label="Cooktop">
                <Select value={data.cooktop} onChange={set("cooktop")}>
                  <option value="">—</option>
                  <option>Gás</option>
                  <option>Indução</option>
                  <option>Sem preferência</option>
                </Select>
              </FieldRow>
              {data.cooktop && data.cooktop !== "Sem preferência" && (
                <FieldRow label="Número de bocas">
                  <Input placeholder="Ex: 4, 5 ou 6 bocas" value={data.numBocas} onChange={set("numBocas")} />
                </FieldRow>
              )}
              <FieldRow label="Coifa / depurador">
                <Select value={data.coifa} onChange={set("coifa")}>
                  <option value="">—</option>
                  <option>Coifa</option>
                  <option>Depurador</option>
                  <option>Sem preferência</option>
                </Select>
              </FieldRow>
              <FieldRow label="Lava-louça">
                <Select value={data.lavaLouca} onChange={set("lavaLouca")}>
                  <option value="">—</option>
                  <option>Sim</option>
                  <option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Cuba">
                <Select value={data.cubaCozinha} onChange={set("cubaCozinha")}>
                  <option value="">—</option>
                  <option>Simples</option>
                  <option>Dupla</option>
                </Select>
              </FieldRow>
              <FieldRow label="Material da bancada">
                <Select value={data.materialBancadaCozinha} onChange={set("materialBancadaCozinha")}>
                  <option value="">—</option>
                  <option>Pedra natural</option>
                  <option>Pedra artificial</option>
                  <option>Corian</option>
                  <option>Porcelanato</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de metal">
                <Select value={data.tipoMetalCozinha} onChange={set("tipoMetalCozinha")}>
                  <option value="">—</option>
                  <option>Cromado</option>
                  <option>Preto</option>
                  <option>Dourado</option>
                  <option>Bronze</option>
                  <option>Rose gold</option>
                </Select>
              </FieldRow>
            </>
          )}

          {/* ── Varanda ─── */}
          {isVaranda && (
            <>
              <FieldRow label="Churrasqueira">
                <Select value={data.churrasqueira} onChange={set("churrasqueira")}>
                  <option value="">—</option>
                  <option>Não</option>
                  <option>Gás</option>
                  <option>Carvão</option>
                  <option>Elétrica</option>
                </Select>
              </FieldRow>
              <FieldRow label="Pergolado">
                <Select value={data.pergolado} onChange={set("pergolado")}>
                  <option value="">—</option>
                  <option>Sim</option>
                  <option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Fechamento de varanda">
                <Select value={data.fechamentoVaranda} onChange={set("fechamentoVaranda")}>
                  <option value="">—</option>
                  <option>Sim</option>
                  <option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Piscina">
                <Select value={data.piscina} onChange={set("piscina")}>
                  <option value="">—</option>
                  <option>Sim</option>
                  <option>Não</option>
                </Select>
              </FieldRow>
            </>
          )}

          {/* Itens desejados */}
          {items.length > 0 && (
            <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
              <p className="text-[12px] mb-2.5" style={{ color: "var(--ink3)" }}>Itens desejados</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const checked = data.itens.includes(item);
                  return (
                    <button key={item} type="button" onClick={() => toggleItem(item)}
                      className="text-[12px] px-3 py-1 rounded-full transition-colors"
                      style={{
                        background: checked ? "var(--accent)" : "var(--surface2)",
                        color: checked ? "#fff" : "var(--ink2)",
                        border: checked ? "0.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                      }}
                    >
                      {checked ? "✓ " : ""}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Móveis existentes a manter */}
          <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>Algum móvel / item existente deve ser mantido?</p>
            <div className="flex gap-5 mb-2">
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
                  style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
                  <input type="radio" name={`aproveitarMoveis-${roomId}`} value={opt}
                    checked={data.aproveitarMoveis === opt}
                    onChange={() => onChange({ ...data, aproveitarMoveis: opt })}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                  {opt}
                </label>
              ))}
            </div>
            {data.aproveitarMoveis === "Sim" && (
              <Textarea
                placeholder="Quais móveis serão mantidos? Ex: sofá da sala, armário do quarto master..."
                value={data.aproveitarMoveisDetalhe}
                onChange={(e) => onChange({ ...data, aproveitarMoveisDetalhe: e.target.value })}
                style={{ minHeight: 55 }}
              />
            )}
          </div>

          {/* Móveis novos */}
          <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>Deseja incluir algum móvel solto novo?</p>
            <div className="flex gap-5 mb-2">
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
                  style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
                  <input type="radio" name={`moveisNovos-${roomId}`} value={opt}
                    checked={data.moveisNovos === opt}
                    onChange={() => onChange({ ...data, moveisNovos: opt })}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                  {opt}
                </label>
              ))}
            </div>
            {data.moveisNovos === "Sim" && (
              <Textarea
                placeholder="Quais móveis novos? Ex: sofá novo, mesa de jantar com 8 lugares..."
                value={data.moveisNovosDetalhe}
                onChange={(e) => onChange({ ...data, moveisNovosDetalhe: e.target.value })}
                style={{ minHeight: 55 }}
              />
            )}
          </div>

          <FieldRow label="Observações livres">
            <Textarea placeholder="Detalhes específicos deste ambiente..." value={data.obs} onChange={set("obs")} style={{ minHeight: 60 }} />
          </FieldRow>
        </div>
      )}
    </div>
  );
}

/* ── stepper ────────────────────────────────────────────── */

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
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium"
                style={{ background: done ? "var(--accent)" : active ? "var(--ink)" : "var(--surface2)", color: done || active ? "#fff" : "var(--ink3)" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[12px]" style={{ color: active ? "var(--ink)" : "var(--ink3)", fontWeight: active ? 500 : 400 }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px mx-1" style={{ background: "var(--border-strong)" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── project selector ───────────────────────────────────── */

function ProjectSelector({
  projetoId,
  onChange,
}: {
  projetoId: string;
  onChange: (id: string) => void;
}) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);

  useEffect(() => {
    setProjetos(getArchiaProjects());
  }, []);

  if (projetos.length === 0) return null;

  return (
    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Projeto:</span>
      <select
        value={projetoId}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] flex-1"
        style={{
          background: "transparent", border: "none", outline: "none",
          color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
        }}
      >
        <option value="">+ Novo projeto</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
        ))}
      </select>
    </div>
  );
}

/* ── serializar ambientes para prompt ───────────────────── */

function serializeRooms(selectedRooms: string[], roomData: Record<string, RoomFields>): string {
  return selectedRooms.map((id) => {
    const label = ROOMS.find((r) => r.id === id)?.label ?? id;
    const d = roomData[id] ?? emptyRoom();
    const isBanheiro = id === "banheiro" || id === "lavabo";
    const isQuarto   = id === "quarto-casal" || id === "quarto-kids";
    const lines = [
      `[${label.toUpperCase()}]`,
      d.estilo                && `• Estilo: ${d.estilo}`,
      d.paredeRevestimento    && `• Revestimento de parede: ${d.paredeRevestimento}`,
      d.pisoRevestimento      && `• Revestimento de piso: ${d.pisoRevestimento}`,
      d.iluminacao            && `• Iluminação: ${d.iluminacao}`,
      d.madeira               && `• Tom de madeira: ${d.madeira}`,
      // quartos
      isQuarto && d.tamanhoCama    && `• Tamanho da cama: ${d.tamanhoCama}`,
      isQuarto && d.tipoCabeceira  && `• Tipo de cabeceira: ${d.tipoCabeceira}`,
      isQuarto && d.bancadaEstudos && `• Bancada de estudos: ${d.bancadaEstudos}`,
      isQuarto && d.penteadeira    && `• Penteadeira: ${d.penteadeira}`,
      // banheiro / lavabo
      isBanheiro && d.tipoBacia        && `• Tipo de bacia: ${d.tipoBacia}`,
      isBanheiro && d.corBacia         && `• Cor da bacia: ${d.corBacia}`,
      isBanheiro && d.tipoCuba         && `• Tipo de cuba: ${d.tipoCuba}`,
      isBanheiro && d.tipoTorneira     && `• Tipo de torneira: ${d.tipoTorneira}`,
      isBanheiro && d.tipoChuveiro     && id === "banheiro" && `• Tipo de chuveiro: ${d.tipoChuveiro}`,
      isBanheiro && d.materialBancada  && `• Material da bancada: ${d.materialBancada}`,
      isBanheiro && d.tipoMetal        && `• Tipo de metal: ${d.tipoMetal}`,
      // cozinha
      id === "cozinha" && d.cooktop              && `• Cooktop: ${d.cooktop}${d.numBocas ? ` — ${d.numBocas} bocas` : ""}`,
      id === "cozinha" && d.coifa                && `• Coifa/depurador: ${d.coifa}`,
      id === "cozinha" && d.lavaLouca            && `• Lava-louça: ${d.lavaLouca}`,
      id === "cozinha" && d.cubaCozinha          && `• Cuba: ${d.cubaCozinha}`,
      id === "cozinha" && d.materialBancadaCozinha && `• Material da bancada: ${d.materialBancadaCozinha}`,
      id === "cozinha" && d.tipoMetalCozinha     && `• Tipo de metal: ${d.tipoMetalCozinha}`,
      // varanda
      id === "varanda" && d.churrasqueira        && `• Churrasqueira: ${d.churrasqueira}`,
      id === "varanda" && d.pergolado            && `• Pergolado: ${d.pergolado}`,
      id === "varanda" && d.fechamentoVaranda    && `• Fechamento de varanda: ${d.fechamentoVaranda}`,
      id === "varanda" && d.piscina              && `• Piscina: ${d.piscina}`,
      // comuns
      d.itens.length > 0 && `• Itens desejados: ${d.itens.join(", ")}`,
      d.aproveitarMoveis && `• Móveis existentes a manter: ${d.aproveitarMoveis}${d.aproveitarMoveisDetalhe ? ` — ${d.aproveitarMoveisDetalhe}` : ""}`,
      d.moveisNovos && `• Móveis novos: ${d.moveisNovos}${d.moveisNovosDetalhe ? ` — ${d.moveisNovosDetalhe}` : ""}`,
      d.obs              && `• Observações: ${d.obs}`,
    ].filter(Boolean);
    return lines.join("\n");
  }).join("\n\n");
}

/* ── link público ───────────────────────────────────────── */

function PublicLinkButton({ s1, selectedRooms, roomData }: {
  s1: Step1;
  selectedRooms: string[];
  roomData: Record<string, RoomFields>;
}) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  function generateLink() {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    // Salva no localStorage os dados iniciais do formulário para referência
    const payload = {
      tipoDetalhado: s1.tipoDetalhado,
      selectedRooms,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`archia_client_form_${token}`, JSON.stringify(payload));
    const url = `${window.location.origin}/briefing/${token}`;
    setLink(url);
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <p className="text-[12px] font-medium mb-3" style={{ color: "var(--ink2)" }}>Enviar formulário para o cliente</p>
      {!link ? (
        <button
          type="button"
          onClick={generateLink}
          className="text-[12px] px-4 py-2 rounded-lg"
          style={{ background: "var(--surface)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Gerar link para cliente
        </button>
      ) : (
        <div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2"
            style={{ background: "var(--surface)", border: "0.5px solid var(--border-strong)" }}>
            <span className="text-[11px] flex-1 truncate" style={{ color: "var(--ink3)", fontFamily: "monospace" }}>{link}</span>
            <button onClick={copyLink} className="text-[11px] px-2 py-0.5 rounded"
              style={{ background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="text-[11px]" style={{ color: "var(--ink3)" }}>
            Envie este link para o cliente. Quando ele preencher, traga o link de resposta para esta página.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── banner: carregar dados do cliente ──────────────────── */

function ClientDataBanner({ onLoad }: { onLoad: (data: Record<string, string>) => void }) {
  const [show, setShow] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#client=")) {
      try {
        const encoded = hash.slice("#client=".length);
        const decoded = JSON.parse(atob(encoded));
        setPendingData(decoded);
        setShow(true);
        window.history.replaceState(null, "", window.location.pathname);
      } catch {
        // ignore malformed hash
      }
    }
  }, []);

  if (!show || !pendingData) return null;

  return (
    <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "#EAF2EC", border: "1px solid #A8D5B2" }}>
      <div className="text-lg">📋</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium" style={{ color: "#1A3A1A" }}>
          Cliente preencheu o briefing — carregar respostas?
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#3A5A3A" }}>
          {pendingData.nome ? `${pendingData.nome} · ` : ""}{Object.keys(pendingData).length} campos preenchidos
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => { onLoad(pendingData); setShow(false); }}
            className="text-[12px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#2D5A3D", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Carregar respostas
          </button>
          <button onClick={() => setShow(false)}
            className="text-[12px] px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", border: "0.5px solid #A8D5B2", color: "#3A5A3A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── página principal ───────────────────────────────────── */

export default function BriefingPage() {
  const { text, isLoading, visible, generate } = useGenerate();
  const [step, setStep] = useState(1);
  const [projetoId, setProjetoId] = useState("");

  const [s1, setS1] = useState<Step1>({
    tipoDetalhado: "", cliente: "", local: "", area: "",
    orcamento: "", prazo: "", moradores: "", pet: "", obsGerais: "",
    modeloBriefing: "",
    tomNeutro: "", corQueGosta: "", corQueNaoQuer: "",
    referenciasVisuais: [],
  });
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [roomData, setRoomData] = useState<Record<string, RoomFields>>({});

  useEffect(() => {
    const saved = localStorage.getItem(BRIEFING_MODEL_KEY);
    if (saved) setS1((prev) => ({ ...prev, modeloBriefing: saved }));
  }, []);

  useEffect(() => {
    localStorage.setItem(BRIEFING_MODEL_KEY, s1.modeloBriefing);
  }, [s1.modeloBriefing]);

  // Carregar projeto existente quando selecionado
  function handleSelectProject(id: string) {
    setProjetoId(id);
    if (!id) return;
    const p = getArchiaProjectById(id);
    if (!p) return;
    setS1((prev) => ({
      ...prev,
      cliente: p.cliente.nome,
      local: p.cliente.localizacao,
      moradores: p.cliente.moradores,
      pet: p.cliente.pet,
      area: p.projeto.area,
      orcamento: p.projeto.orcamento,
      prazo: p.projeto.prazo,
      tipoDetalhado: p.projeto.tipo,
      tomNeutro: p.cliente.perfilEstetico.tomNeutro,
      corQueGosta: p.cliente.perfilEstetico.corQueGosta,
      corQueNaoQuer: p.cliente.perfilEstetico.corQueNaoQuer,
      referenciasVisuais: p.cliente.referenciasVisuais ?? [],
    }));
    if (p.ambientesOrdem.length > 0) {
      setSelectedRooms(p.ambientesOrdem);
      setRoomData(p.ambientes as Record<string, RoomFields>);
    }
  }

  // Carregar respostas do cliente via hash
  function handleLoadClientData(data: Record<string, string>) {
    setS1((prev) => ({
      ...prev,
      cliente: data.nome || prev.cliente,
      local: data.localizacao || prev.local,
      moradores: data.moradores || prev.moradores,
      pet: data.pet || prev.pet,
      area: data.area || prev.area,
      orcamento: data.orcamento || prev.orcamento,
      prazo: data.prazo || prev.prazo,
      tipoDetalhado: data.tipoDetalhado || prev.tipoDetalhado,
      tomNeutro: data.tomNeutro || prev.tomNeutro,
      corQueGosta: data.corQueGosta || prev.corQueGosta,
      corQueNaoQuer: data.corQueNaoQuer || prev.corQueNaoQuer,
      obsGerais: data.obsGerais || prev.obsGerais,
      referenciasVisuais: data.referenciasVisuais
        ? JSON.parse(data.referenciasVisuais) as string[]
        : prev.referenciasVisuais,
    }));
    if (data.selectedRooms) {
      try {
        const rooms = JSON.parse(data.selectedRooms) as string[];
        setSelectedRooms(rooms);
        rooms.forEach((id) => {
          if (!roomData[id]) setRoomData((prev) => ({ ...prev, [id]: emptyRoom() }));
        });
      } catch { /* ignore */ }
    }
  }

  const setS1Field = (k: keyof Step1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setS1((prev) => ({ ...prev, [k]: e.target.value }));

  function toggleRoom(id: string) {
    setSelectedRooms((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
    if (!roomData[id]) setRoomData((prev) => ({ ...prev, [id]: emptyRoom() }));
  }

  function handleGenerate() {
    if (selectedRooms.length === 0) { alert("Selecione pelo menos um ambiente."); return; }
    const linksValidos = s1.referenciasVisuais.filter((l) => l.trim() !== "");
    const dados = {
      ...s1,
      ambientesDetalhados: serializeRooms(selectedRooms, roomData),
      referenciasVisuais: linksValidos.join("\n"),
    };
    generate("briefing", dados, s1.cliente || "Briefing", (fullText) => {
      // Salva / atualiza projeto unificado
      const existing = projetoId ? getArchiaProjectById(projetoId) : null;
      const projeto: ArchiaProjetoUnificado = {
        id: existing?.id ?? crypto.randomUUID(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cliente: {
          nome: s1.cliente,
          localizacao: s1.local,
          moradores: s1.moradores,
          pet: s1.pet,
          perfilEstetico: {
            tomNeutro: s1.tomNeutro,
            corQueGosta: s1.corQueGosta,
            corQueNaoQuer: s1.corQueNaoQuer,
          },
          referenciasVisuais: linksValidos,
        },
        projeto: {
          tipo: s1.tipoDetalhado,
          area: s1.area,
          orcamento: s1.orcamento,
          prazo: s1.prazo,
        },
        ambientes: roomData as Record<string, AmbienteData>,
        ambientesOrdem: selectedRooms,
        documentos: {
          ...(existing?.documentos ?? {}),
          briefing: { conteudo: fullText, data: new Date().toISOString() },
        },
      };
      saveArchiaProject(projeto);
      setProjetoId(projeto.id);
    });
  }

  const btnStyle = {
    background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 6,
  } as React.CSSProperties;

  const btnSecStyle = { ...btnStyle, background: "transparent", color: "var(--ink2)", border: "0.5px solid var(--border-strong)" } as React.CSSProperties;

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Briefing técnico</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Preencha por ambiente — a IA gera o briefing em formato de checklist
        </p>
      </div>

      <ClientDataBanner onLoad={handleLoadClientData} />
      <ProjectSelector projetoId={projetoId} onChange={handleSelectProject} />
      <Stepper step={step} />

      {/* ── PASSO 1 ─────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Tipo de projeto</p>
          <div className="grid grid-cols-5 gap-2 mb-7">
            {TIPOS_PROJETO.map((t) => {
              const active = s1.tipoDetalhado === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setS1((prev) => ({ ...prev, tipoDetalhado: t.id }))}
                  className="flex flex-col items-center text-center p-3 rounded-xl transition-all"
                  style={{
                    border: active ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                    background: active ? "var(--accent-light)" : "var(--surface)",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <span className="text-[12px] font-medium" style={{ color: active ? "var(--accent)" : "var(--ink)" }}>{t.label}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: active ? "var(--accent)" : "var(--ink3)" }}>{t.sub}</span>
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

          {/* Perfil estético */}
          <div className="mt-7">
            <SectionDivider>Perfil estético</SectionDivider>
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Tom neutro preferido">
                <Select value={s1.tomNeutro} onChange={setS1Field("tomNeutro")}>
                  <option value="">—</option>
                  <option>Cinza</option>
                  <option>Bege</option>
                  <option>Sem preferência</option>
                </Select>
              </FormGroup>
              <FormGroup label="Cor que mais gosta">
                <Input placeholder="Ex: verde escuro, terracota..." value={s1.corQueGosta} onChange={setS1Field("corQueGosta")} />
              </FormGroup>
              <FormGroup label="Cor que definitivamente NÃO quer" full>
                <Input placeholder="Ex: amarelo, rosa, laranja..." value={s1.corQueNaoQuer} onChange={setS1Field("corQueNaoQuer")} />
              </FormGroup>
            </div>
          </div>

          {/* Referências visuais */}
          <div className="mt-7">
            <SectionDivider>Referências visuais</SectionDivider>
            <FormGroup label="Links de referência (opcional)" full>
              <MultiLinkField
                links={s1.referenciasVisuais}
                onChange={(links) => setS1((prev) => ({ ...prev, referenciasVisuais: links }))}
              />
            </FormGroup>
          </div>

          {/* Modelo de briefing */}
          <div className="mt-7">
            <SectionDivider>Modelo de briefing do escritório</SectionDivider>
            <FormGroup label="Cole um briefing anterior como modelo (opcional)" full>
              <Textarea
                placeholder={`Cole aqui o texto de um briefing seu anterior — do Word, PDF ou e-mail. A IA vai seguir a mesma estrutura, formato e tom, substituindo pelos dados deste novo projeto.\n\nEx: "BRIEFING TÉCNICO — Residência XYZ\n\nSALA DE ESTAR\n• Estilo: Contemporâneo...\n• Piso: porcelanato 120x60..."`}
                value={s1.modeloBriefing}
                onChange={setS1Field("modeloBriefing")}
                style={{ minHeight: 140 }}
              />
              <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--ink3)" }}>
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 flex-shrink-0" style={{ color: "var(--accent)" }}>
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Salvo automaticamente — use uma vez, serve para todos os briefings futuros
              </p>
            </FormGroup>
          </div>

          <div className="mt-6 flex justify-end">
            <button style={btnStyle} onClick={() => {
              if (!s1.tipoDetalhado || !s1.cliente) { alert("Selecione o tipo de projeto e informe o nome do cliente."); return; }
              setStep(2);
            }}>
              Selecionar ambientes →
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 2 ─────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Quais ambientes fazem parte do projeto?</p>
          <div className="grid grid-cols-2 gap-2 mb-7">
            {ROOMS.map((room) => {
              const checked = selectedRooms.includes(room.id);
              return (
                <button key={room.id} type="button" onClick={() => toggleRoom(room.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    border: checked ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)",
                    background: checked ? "var(--accent-light)" : "var(--surface)",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: checked ? "var(--accent)" : "transparent", border: checked ? "none" : "1.5px solid var(--border-strong)" }}>
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
            <button style={btnStyle} onClick={() => {
              if (selectedRooms.length === 0) { alert("Selecione pelo menos um ambiente."); return; }
              setStep(3);
            }}>
              Preencher detalhes →
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 3 ─────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Detalhes por ambiente</p>
          {selectedRooms.map((id) => {
            const room = ROOMS.find((r) => r.id === id);
            return (
              <RoomForm key={id} roomId={id} roomLabel={room?.label ?? id}
                data={roomData[id] ?? emptyRoom()}
                onChange={(updated) => setRoomData((prev) => ({ ...prev, [id]: updated }))}
              />
            );
          })}
          <div className="flex items-center justify-between mt-6">
            <button style={btnSecStyle} onClick={() => setStep(2)}>← Ambientes</button>
            <button onClick={handleGenerate} disabled={isLoading}
              style={{ ...btnStyle, opacity: isLoading ? 0.5 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
              {isLoading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Gerando...</>
              ) : (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Gerar briefing</>
              )}
            </button>
          </div>
        </div>
      )}

      <TemplateRenderer text={text} isStreaming={isLoading} visible={visible} />

      {/* Link público — aparece após geração */}
      {visible && !isLoading && (
        <PublicLinkButton s1={s1} selectedRooms={selectedRooms} roomData={roomData} />
      )}
    </div>
  );
}
