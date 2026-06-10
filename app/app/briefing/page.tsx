"use client";

import TemplateRenderer from "@/components/TemplateRenderer";
import { useGenerate } from "@/lib/useGenerate";
import { useEffect, useRef, useState } from "react";
import { Input, Select, Textarea, FormGroup, SectionDivider } from "@/components/DocumentForm";
import FileUploadField from "@/components/FileUploadField";
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

// Rooms with quantity selector (multi-instance)
const MULTI_ROOMS = ["quarto", "banheiro", "closet", "varanda"] as const;
type MultiRoomId = typeof MULTI_ROOMS[number];

const ROOMS = [
  { id: "sala",         label: "Sala de estar / jantar", multi: false },
  { id: "cozinha",      label: "Cozinha",                multi: false },
  { id: "quarto",       label: "Quarto",                 multi: true  },
  { id: "banheiro",     label: "Banheiro",               multi: true  },
  { id: "lavabo",       label: "Lavabo",                 multi: false },
  { id: "closet",       label: "Closet",                 multi: true  },
  { id: "area-servico", label: "Área de serviço",        multi: false },
  { id: "varanda",      label: "Varanda / área gourmet", multi: true  },
  { id: "home-office",  label: "Home office",            multi: false },
];

const BASE_LABELS: Record<string, string> = Object.fromEntries(ROOMS.map((r) => [r.id, r.label]));

const ROOM_ITEMS: Record<string, string[]> = {
  "sala":         ["Painel de TV", "Lareira", "Bancada / bar", "Mesa extensível", "Adega", "Sofá em L"],
  "cozinha":      ["Forno embutido", "Geladeira side-by-side", "Despensa", "Bancada extra"],
  "quarto":       ["Cabeceira painel", "Closet integrado", "Bancada maquiagem", "TV painel", "Escritório integrado", "Sacada", "Beliche", "Escrivaninha", "Cantinho leitura"],
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
const emptyRoom = (nome?: string): RoomFields => emptyAmbiente(nome);

// Returns the base room id from a full key like "quarto_0" → "quarto"
function baseId(fullId: string): string {
  return fullId.replace(/_\d+$/, "");
}

// Expand selected base rooms into full instance keys
function expandRooms(selectedRooms: string[], roomQuantities: Record<string, number>): string[] {
  return selectedRooms.flatMap((id) => {
    if (MULTI_ROOMS.includes(id as MultiRoomId)) {
      const qty = roomQuantities[id] ?? 1;
      return Array.from({ length: qty }, (_, i) => `${id}_${i}`);
    }
    return [id];
  });
}

function instanceLabel(fullId: string, data?: RoomFields): string {
  const match = fullId.match(/^([a-z-]+)_(\d+)$/);
  if (match) {
    const idx = parseInt(match[2], 10);
    if (data?.nome?.trim()) return data.nome;
    return `${BASE_LABELS[match[1]] ?? match[1]} ${idx + 1}`;
  }
  return BASE_LABELS[fullId] ?? fullId;
}

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

function MultiLinkField({ links, onChange }: { links: string[]; onChange: (links: string[]) => void }) {
  const MAX = 10;
  const list = links.length > 0 ? links : [""];
  function setLink(i: number, val: string) { const n = [...list]; n[i] = val; onChange(n); }
  function addLink() { if (list.length < MAX) onChange([...list, ""]); }
  function removeLink(i: number) { const n = list.filter((_, idx) => idx !== i); onChange(n.length > 0 ? n : [""]); }
  return (
    <div>
      <div className="flex flex-col gap-2">
        {list.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="url" value={link} onChange={(e) => setLink(i, e.target.value)}
              placeholder="Ex: link do Pinterest, Instagram, Google Drive..."
              className="flex-1 text-[13px] px-3 py-2 rounded-lg"
              style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
            {list.length > 1 && (
              <button type="button" onClick={() => removeLink(i)}
                className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {list.length < MAX && (
        <button type="button" onClick={addLink} className="mt-2 text-[12px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" /></svg>
          Adicionar link
        </button>
      )}
      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--ink3)" }}>
        Cole links de imagens, painéis do Pinterest ou pastas do Drive com referências.
      </p>
    </div>
  );
}

/* ── linha de campo ─────────────────────────────────────── */

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <span className="text-[12px] w-44 flex-shrink-0 pt-2.5" style={{ color: "var(--ink3)" }}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function RadioRow({ label, name, value, onChange, options }: {
  label: string; name: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>{label}</p>
      <div className="flex gap-5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
            style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
            <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── form de um ambiente ────────────────────────────────── */

function RoomForm({ fullId, label, data, onChange }: {
  fullId: string;
  label: string;
  data: RoomFields;
  onChange: (updated: RoomFields) => void;
}) {
  const [open, setOpen] = useState(true);
  const base = baseId(fullId);
  const items = ROOM_ITEMS[base] ?? [];
  const isMultiInstance = /^[a-z-]+_\d+$/.test(fullId);

  const isBanheiro = base === "banheiro" || base === "lavabo";
  const isCozinha  = base === "cozinha";
  const isVaranda  = base === "varanda";
  const isQuarto   = base === "quarto";

  function toggleItem(item: string) {
    const cur = data.itens;
    onChange({ ...data, itens: cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item] });
  }
  const set = (k: keyof RoomFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [k]: e.target.value });

  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
      {/* header */}
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:opacity-80"
        style={{ background: "var(--surface2)" }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isMultiInstance ? (
            <input
              type="text"
              value={data.nome ?? label}
              onChange={(e) => { e.stopPropagation(); onChange({ ...data, nome: e.target.value }); }}
              onClick={(e) => e.stopPropagation()}
              placeholder={label}
              className="text-[13px] font-medium bg-transparent outline-none border-b flex-1 min-w-0"
              style={{
                color: "var(--ink)",
                borderColor: "var(--border-strong)",
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: 260,
              }}
            />
          ) : (
            <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{label}</span>
          )}
          {isMultiInstance && (
            <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "var(--surface)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}>
              {label}
            </span>
          )}
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 transition-transform flex-shrink-0"
          style={{ color: "var(--ink3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4">
          {/* Tipo de quarto (only for quarto instances) */}
          {isQuarto && (
            <FieldRow label="Tipo de quarto">
              <Select value={data.tipoQuarto ?? ""} onChange={(e) => onChange({ ...data, tipoQuarto: e.target.value })}>
                <option value="">—</option>
                <option>Casal</option>
                <option>Kids / infantil</option>
                <option>Hóspedes</option>
                <option>Suíte</option>
                <option>Multiuso</option>
              </Select>
            </FieldRow>
          )}

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

          {/* Quartos */}
          {isQuarto && (
            <>
              <FieldRow label="Tamanho da cama">
                <Select value={data.tamanhoCama} onChange={set("tamanhoCama")}>
                  <option value="">—</option>
                  <option>Solteiro</option><option>Casal</option><option>Queen</option>
                  <option>King</option><option>Super King</option><option>Sofá-cama</option>
                  <option>Manter existente</option><option>Sem cama</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cabeceira">
                <Select value={data.tipoCabeceira} onChange={set("tipoCabeceira")}>
                  <option value="">—</option>
                  <option>Estofada</option><option>Madeira</option><option>Manter existente</option>
                </Select>
              </FieldRow>
              <RadioRow label="Bancada de estudos / trabalho?" name={`bancadaEstudos-${fullId}`}
                value={data.bancadaEstudos} onChange={(v) => onChange({ ...data, bancadaEstudos: v })}
                options={["Sim", "Não"]} />
              <RadioRow label="Penteadeira?" name={`penteadeira-${fullId}`}
                value={data.penteadeira} onChange={(v) => onChange({ ...data, penteadeira: v })}
                options={["Sim", "Não"]} />
            </>
          )}

          {/* Banheiro / Lavabo */}
          {isBanheiro && (
            <>
              <FieldRow label="Tipo de bacia">
                <Select value={data.tipoBacia} onChange={set("tipoBacia")}>
                  <option value="">—</option>
                  <option>Com caixa acoplada</option><option>Sem caixa (acopla embutida)</option>
                  <option>Suspensa</option><option>Manter existente</option>
                </Select>
              </FieldRow>
              <FieldRow label="Cor da bacia">
                <Select value={data.corBacia} onChange={set("corBacia")}>
                  <option value="">—</option>
                  <option>Branca</option><option>Preta</option><option>Manter existente</option><option>Outro</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cuba">
                <Select value={data.tipoCuba} onChange={set("tipoCuba")}>
                  <option value="">—</option>
                  <option>Embutir</option><option>Apoio</option><option>Esculpida</option>
                  <option>Sobrepor</option><option>Semi-encaixe</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de torneira">
                <Select value={data.tipoTorneira} onChange={set("tipoTorneira")}>
                  <option value="">—</option>
                  <option>Monocomando</option><option>Duplo comando</option><option>Bica alta</option>
                  <option>Torneira de parede</option><option>Torneira de piso</option>
                </Select>
              </FieldRow>
              {base === "banheiro" && (
                <FieldRow label="Tipo de chuveiro">
                  <Select value={data.tipoChuveiro} onChange={set("tipoChuveiro")}>
                    <option value="">—</option>
                    <option>Chuveiro de teto</option><option>Chuveiro de parede</option><option>Sem preferência</option>
                  </Select>
                </FieldRow>
              )}
              <FieldRow label="Material da bancada">
                <Select value={data.materialBancada} onChange={set("materialBancada")}>
                  <option value="">—</option>
                  <option>Pedra natural</option><option>Pedra artificial</option>
                  <option>Corian</option><option>Porcelanato</option><option>Madeira</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de metal">
                <Select value={data.tipoMetal} onChange={set("tipoMetal")}>
                  <option value="">—</option>
                  <option>Cromado</option><option>Preto</option><option>Dourado</option>
                  <option>Bronze</option><option>Rose gold</option>
                </Select>
              </FieldRow>
            </>
          )}

          {/* Cozinha */}
          {isCozinha && (
            <>
              <FieldRow label="Cooktop">
                <Select value={data.cooktop} onChange={set("cooktop")}>
                  <option value="">—</option>
                  <option>Gás</option><option>Indução</option><option>Sem preferência</option>
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
                  <option>Coifa</option><option>Depurador</option><option>Sem preferência</option>
                </Select>
              </FieldRow>
              <FieldRow label="Lava-louça">
                <Select value={data.lavaLouca} onChange={set("lavaLouca")}>
                  <option value="">—</option><option>Sim</option><option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Cuba">
                <Select value={data.cubaCozinha} onChange={set("cubaCozinha")}>
                  <option value="">—</option><option>Simples</option><option>Dupla</option>
                </Select>
              </FieldRow>
              <FieldRow label="Material da bancada">
                <Select value={data.materialBancadaCozinha} onChange={set("materialBancadaCozinha")}>
                  <option value="">—</option>
                  <option>Pedra natural</option><option>Pedra artificial</option>
                  <option>Corian</option><option>Porcelanato</option>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de metal">
                <Select value={data.tipoMetalCozinha} onChange={set("tipoMetalCozinha")}>
                  <option value="">—</option>
                  <option>Cromado</option><option>Preto</option><option>Dourado</option>
                  <option>Bronze</option><option>Rose gold</option>
                </Select>
              </FieldRow>
            </>
          )}

          {/* Varanda */}
          {isVaranda && (
            <>
              <FieldRow label="Churrasqueira">
                <Select value={data.churrasqueira} onChange={set("churrasqueira")}>
                  <option value="">—</option>
                  <option>Não</option><option>Gás</option><option>Carvão</option><option>Elétrica</option>
                </Select>
              </FieldRow>
              <FieldRow label="Pergolado">
                <Select value={data.pergolado} onChange={set("pergolado")}>
                  <option value="">—</option><option>Sim</option><option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Fechamento de varanda">
                <Select value={data.fechamentoVaranda} onChange={set("fechamentoVaranda")}>
                  <option value="">—</option><option>Sim</option><option>Não</option>
                </Select>
              </FieldRow>
              <FieldRow label="Piscina">
                <Select value={data.piscina} onChange={set("piscina")}>
                  <option value="">—</option><option>Sim</option><option>Não</option>
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
                      }}>
                      {checked ? "✓ " : ""}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Móveis existentes */}
          <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>Algum móvel / item existente deve ser mantido?</p>
            <div className="flex gap-5 mb-2">
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
                  style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
                  <input type="radio" name={`aproveitarMoveis-${fullId}`} value={opt}
                    checked={data.aproveitarMoveis === opt}
                    onChange={() => onChange({ ...data, aproveitarMoveis: opt })}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                  {opt}
                </label>
              ))}
            </div>
            {data.aproveitarMoveis === "Sim" && (
              <Textarea placeholder="Quais móveis serão mantidos?"
                value={data.aproveitarMoveisDetalhe}
                onChange={(e) => onChange({ ...data, aproveitarMoveisDetalhe: e.target.value })}
                style={{ minHeight: 55 }} />
            )}
          </div>

          {/* Móveis novos */}
          <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>Deseja incluir algum móvel solto novo?</p>
            <div className="flex gap-5 mb-2">
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
                  style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
                  <input type="radio" name={`moveisNovos-${fullId}`} value={opt}
                    checked={data.moveisNovos === opt}
                    onChange={() => onChange({ ...data, moveisNovos: opt })}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                  {opt}
                </label>
              ))}
            </div>
            {data.moveisNovos === "Sim" && (
              <Textarea placeholder="Quais móveis novos?"
                value={data.moveisNovosDetalhe}
                onChange={(e) => onChange({ ...data, moveisNovosDetalhe: e.target.value })}
                style={{ minHeight: 55 }} />
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

/* ── preenchimento automático (briefing) ────────────────── */

type BriefingAutoFill = {
  cliente?: string; tipoDetalhado?: string; local?: string;
  area?: string; orcamento?: string; prazo?: string;
  moradores?: string; obsGerais?: string;
};

function AutoFillBriefing({ onFill }: { onFill: (data: BriefingAutoFill) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const fileObjRef = useRef<File | null>(null);

  async function handleExtract() {
    if (!text.trim() && !fileObjRef.current) {
      setErrorMsg("Cole um texto ou envie um arquivo para continuar.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const fd = new FormData();
      if (text.trim()) fd.append("text", text.trim());
      if (fileObjRef.current) fd.append("file", fileObjRef.current);
      const res = await fetch("/api/extract-fields", { method: "POST", body: fd });
      const json = await res.json() as { fields?: Record<string, string | null>; error?: string };
      if (!res.ok || json.error) { setErrorMsg(json.error ?? "Erro."); setStatus("error"); return; }
      const raw = json.fields ?? {};
      const mapped: BriefingAutoFill = {};
      if (raw.nome)        mapped.cliente = raw.nome;
      if (raw.localizacao) mapped.local = raw.localizacao;
      if (raw.metragem)    mapped.area = raw.metragem;
      if (raw.orcamento)   mapped.orcamento = raw.orcamento;
      if (raw.prazo)       mapped.prazo = raw.prazo;
      if (raw.descricao)   mapped.obsGerais = raw.descricao;
      if (raw.tipo_projeto) {
        const tp = raw.tipo_projeto.toLowerCase();
        if (tp.includes("residencial")) mapped.tipoDetalhado = tp.includes("casa") ? "residencial-casa" : "residencial-apto";
        else if (tp.includes("comercial")) mapped.tipoDetalhado = "comercial";
        else if (tp.includes("reforma")) mapped.tipoDetalhado = "reforma";
        else if (tp.includes("interior")) mapped.tipoDetalhado = "interiores";
      }
      if (Object.keys(mapped).length === 0) {
        setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
        setStatus("error"); return;
      }
      onFill(mapped);
      setStatus("success");
    } catch {
      setErrorMsg("Não conseguimos extrair informações — preencha manualmente.");
      setStatus("error");
    }
  }

  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border-strong)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:opacity-80"
        style={{ background: "var(--surface2)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px]">⚡</span>
          <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Preenchimento automático</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}>opcional</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 transition-transform"
          style={{ color: "var(--ink3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4" style={{ background: "var(--surface)" }}>
          <p className="text-[12px] mb-4" style={{ color: "var(--ink3)" }}>
            Cole a mensagem do cliente ou envie um print — a IA preenche nome, tipo, localização, área, orçamento e prazo automaticamente
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Mensagem ou texto</p>
              <textarea value={text} onChange={(e) => { setText(e.target.value); setStatus("idle"); }}
                placeholder={"Cole aqui a mensagem do WhatsApp, e-mail ou descrição que o cliente enviou..."}
                className="w-full text-[12px] px-3 py-2.5 rounded-xl resize-none" rows={5}
                style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--ink3)" }}>Ou envie um print/documento</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:opacity-80"
                style={{ border: "0.5px dashed var(--border-strong)", background: "var(--surface2)", cursor: "pointer", height: 116, fontFamily: "'DM Sans', sans-serif" }}>
                {fileName ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" style={{ color: "var(--accent)" }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[11px] text-center px-2 break-all" style={{ color: "var(--ink2)" }}>{fileName}</span>
                  <span className="text-[10px]" style={{ color: "var(--ink3)" }}>Clique para trocar</span></>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" style={{ color: "var(--ink3)" }}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-[12px]" style={{ color: "var(--ink3)" }}>JPG, PNG ou PDF</span>
                  <span className="text-[10px]" style={{ color: "var(--ink3)" }}>até 5MB</span></>
                )}
              </button>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 5*1024*1024) { fileObjRef.current = f; setFileName(f.name); setStatus("idle"); } }} />
            </div>
          </div>
          {status === "error" && (
            <div className="mt-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-xl"
              style={{ background: "#FDEDEC", color: "#C0392B", border: "0.5px solid #F5B7B1" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              {errorMsg}
            </div>
          )}
          {status === "success" && (
            <div className="mt-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-xl"
              style={{ background: "#EAF2EC", color: "#2D5A3D", border: "0.5px solid #A8D5B2" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Campos preenchidos automaticamente — revise antes de continuar
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={handleExtract} disabled={status === "loading"}
              className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-xl text-white"
              style={{ background: "var(--accent)", border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              {status === "loading" ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processando...</>
              ) : (
                <><span>⚡</span>Preencher campos automaticamente</>
              )}
            </button>
          </div>
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "var(--ink3)" }}>
            O conteúdo colado ou enviado é processado para extração e não é armazenado. Pode conter dados pessoais do cliente — use com discrição.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── stepper ─────────────────────────────────────────────── */

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

/* ── project selector ─────────────────────────────────────── */

function ProjectSelector({ projetoId, onChange }: { projetoId: string; onChange: (id: string) => void }) {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  useEffect(() => { setProjetos(getArchiaProjects()); }, []);
  if (projetos.length === 0) return null;
  return (
    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}>
      <span className="text-[12px]" style={{ color: "var(--ink3)" }}>Projeto:</span>
      <select value={projetoId} onChange={(e) => onChange(e.target.value)} className="text-[13px] flex-1"
        style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <option value="">+ Novo projeto</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
        ))}
      </select>
    </div>
  );
}

/* ── serializar ambientes para o prompt ─────────────────── */

function serializeRooms(allIds: string[], roomData: Record<string, RoomFields>): string {
  return allIds.map((fullId) => {
    const d = roomData[fullId] ?? emptyRoom();
    const base = baseId(fullId);
    const label = instanceLabel(fullId, d);

    const isBan = base === "banheiro" || base === "lavabo";
    const isQto = base === "quarto";

    const lines = [
      `[${label.toUpperCase()}]`,
      isQto && d.tipoQuarto   && `• Tipo: ${d.tipoQuarto}`,
      d.estilo                && `• Estilo: ${d.estilo}`,
      d.paredeRevestimento    && `• Revestimento de parede: ${d.paredeRevestimento}`,
      d.pisoRevestimento      && `• Revestimento de piso: ${d.pisoRevestimento}`,
      d.iluminacao            && `• Iluminação: ${d.iluminacao}`,
      d.madeira               && `• Tom de madeira: ${d.madeira}`,
      isQto && d.tamanhoCama   && `• Tamanho da cama: ${d.tamanhoCama}`,
      isQto && d.tipoCabeceira && `• Tipo de cabeceira: ${d.tipoCabeceira}`,
      isQto && d.bancadaEstudos && `• Bancada de estudos: ${d.bancadaEstudos}`,
      isQto && d.penteadeira   && `• Penteadeira: ${d.penteadeira}`,
      isBan && d.tipoBacia     && `• Tipo de bacia: ${d.tipoBacia}`,
      isBan && d.corBacia      && `• Cor da bacia: ${d.corBacia}`,
      isBan && d.tipoCuba      && `• Tipo de cuba: ${d.tipoCuba}`,
      isBan && d.tipoTorneira  && `• Tipo de torneira: ${d.tipoTorneira}`,
      isBan && base === "banheiro" && d.tipoChuveiro && `• Tipo de chuveiro: ${d.tipoChuveiro}`,
      isBan && d.materialBancada && `• Material da bancada: ${d.materialBancada}`,
      isBan && d.tipoMetal     && `• Tipo de metal: ${d.tipoMetal}`,
      base === "cozinha" && d.cooktop && `• Cooktop: ${d.cooktop}${d.numBocas ? ` — ${d.numBocas} bocas` : ""}`,
      base === "cozinha" && d.coifa && `• Coifa/depurador: ${d.coifa}`,
      base === "cozinha" && d.lavaLouca && `• Lava-louça: ${d.lavaLouca}`,
      base === "cozinha" && d.cubaCozinha && `• Cuba: ${d.cubaCozinha}`,
      base === "cozinha" && d.materialBancadaCozinha && `• Material da bancada: ${d.materialBancadaCozinha}`,
      base === "cozinha" && d.tipoMetalCozinha && `• Tipo de metal: ${d.tipoMetalCozinha}`,
      base === "varanda" && d.churrasqueira && `• Churrasqueira: ${d.churrasqueira}`,
      base === "varanda" && d.pergolado && `• Pergolado: ${d.pergolado}`,
      base === "varanda" && d.fechamentoVaranda && `• Fechamento de varanda: ${d.fechamentoVaranda}`,
      base === "varanda" && d.piscina && `• Piscina: ${d.piscina}`,
      d.itens.length > 0 && `• Itens desejados: ${d.itens.join(", ")}`,
      d.aproveitarMoveis && `• Móveis existentes: ${d.aproveitarMoveis}${d.aproveitarMoveisDetalhe ? ` — ${d.aproveitarMoveisDetalhe}` : ""}`,
      d.moveisNovos && `• Móveis novos: ${d.moveisNovos}${d.moveisNovosDetalhe ? ` — ${d.moveisNovosDetalhe}` : ""}`,
      d.obs && `• Observações: ${d.obs}`,
    ].filter(Boolean);
    return lines.join("\n");
  }).join("\n\n");
}

/* ── botão de link para o cliente ─────────────────────────── */

function ClientLinkButton() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  function handleGenerate() {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    localStorage.setItem(`archia_client_form_${token}`, JSON.stringify({ createdAt: new Date().toISOString() }));
    setLink(`${window.location.origin}/briefing/${token}`);
  }
  function handleCopy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  if (link) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0"
        style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", maxWidth: 320 }}>
        <span className="text-[11px] truncate flex-1" style={{ color: "var(--ink3)", fontFamily: "monospace" }}>{link}</span>
        <button onClick={handleCopy} className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg text-white"
          style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={handleGenerate}
      className="flex-shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg transition-colors"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)", color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
      Formulário para o cliente
    </button>
  );
}

/* ── banner de dados do cliente ─────────────────────────── */

function ClientDataBanner({ onLoad }: { onLoad: (data: Record<string, string>) => void }) {
  const [show, setShow] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#client=")) {
      try {
        const decoded = JSON.parse(atob(hash.slice("#client=".length)));
        setPendingData(decoded);
        setShow(true);
        window.history.replaceState(null, "", window.location.pathname);
      } catch { /* ignore */ }
    }
  }, []);
  if (!show || !pendingData) return null;
  return (
    <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: "#EAF2EC", border: "1px solid #A8D5B2" }}>
      <div className="text-lg">📋</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium" style={{ color: "#1A3A1A" }}>Cliente preencheu o briefing — carregar respostas?</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#3A5A3A" }}>
          {pendingData.nome ? `${pendingData.nome} · ` : ""}{Object.keys(pendingData).length} campos preenchidos
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onLoad(pendingData); setShow(false); }} className="text-[12px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "#2D5A3D", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Carregar respostas
          </button>
          <button onClick={() => setShow(false)} className="text-[12px] px-3 py-1.5 rounded-lg"
            style={{ background: "transparent", border: "0.5px solid #A8D5B2", color: "#3A5A3A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── página principal ─────────────────────────────────────── */

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

  // Base IDs like ["sala", "quarto", "banheiro"]
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  // Quantities for multi rooms: { quarto: 2, banheiro: 2 }
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  // All room data keyed by full ID: { sala: {...}, quarto_0: {...}, quarto_1: {...} }
  const [roomData, setRoomData] = useState<Record<string, RoomFields>>({});

  useEffect(() => {
    const saved = localStorage.getItem(BRIEFING_MODEL_KEY);
    if (saved) setS1((prev) => ({ ...prev, modeloBriefing: saved }));
  }, []);

  useEffect(() => {
    localStorage.setItem(BRIEFING_MODEL_KEY, s1.modeloBriefing);
  }, [s1.modeloBriefing]);

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
      // Reconstruct selectedRooms and quantities from ambientesOrdem
      const newSelected: string[] = [];
      const newQtys: Record<string, number> = {};
      for (const fullId of p.ambientesOrdem) {
        const b = baseId(fullId);
        const isMulti = MULTI_ROOMS.includes(b as MultiRoomId);
        if (isMulti) {
          if (!newSelected.includes(b)) newSelected.push(b);
          newQtys[b] = (newQtys[b] ?? 0) + 1;
        } else {
          if (!newSelected.includes(fullId)) newSelected.push(fullId);
        }
      }
      setSelectedRooms(newSelected);
      setRoomQuantities(newQtys);
      setRoomData(p.ambientes as Record<string, RoomFields>);
    }
  }

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
    const isMulti = MULTI_ROOMS.includes(id as MultiRoomId);
    setSelectedRooms((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      return [...prev, id];
    });
    if (isMulti) {
      const qty = roomQuantities[id] ?? 1;
      setRoomQuantities((prev) => ({ ...prev, [id]: qty }));
      // Init instances if not present
      setRoomData((prev) => {
        const next = { ...prev };
        const label = BASE_LABELS[id] ?? id;
        for (let i = 0; i < qty; i++) {
          const key = `${id}_${i}`;
          if (!next[key]) next[key] = emptyRoom(`${label} ${i + 1}`);
        }
        return next;
      });
    } else {
      if (!roomData[id]) setRoomData((prev) => ({ ...prev, [id]: emptyRoom() }));
    }
  }

  function setRoomQty(id: string, qty: number) {
    const clampedQty = Math.max(1, Math.min(6, qty));
    setRoomQuantities((prev) => ({ ...prev, [id]: clampedQty }));
    setRoomData((prev) => {
      const next = { ...prev };
      const label = BASE_LABELS[id] ?? id;
      for (let i = 0; i < clampedQty; i++) {
        const key = `${id}_${i}`;
        if (!next[key]) next[key] = emptyRoom(`${label} ${i + 1}`);
      }
      // Remove excess instances
      for (let i = clampedQty; i < 6; i++) {
        delete next[`${id}_${i}`];
      }
      return next;
    });
  }

  const allInstanceIds = expandRooms(selectedRooms, roomQuantities);

  function handleGenerate() {
    if (selectedRooms.length === 0) { alert("Selecione pelo menos um ambiente."); return; }
    const linksValidos = s1.referenciasVisuais.filter((l) => l.trim() !== "");
    const dados = {
      ...s1,
      ambientesDetalhados: serializeRooms(allInstanceIds, roomData),
      referenciasVisuais: linksValidos.join("\n"),
    };
    generate("briefing", dados, s1.cliente || "Briefing", (fullText) => {
      const existing = projetoId ? getArchiaProjectById(projetoId) : null;
      // Build ambientes object (only include used instance keys)
      const ambientesObj: Record<string, AmbienteData> = {};
      for (const id of allInstanceIds) {
        if (roomData[id]) ambientesObj[id] = roomData[id];
      }
      // Also include simple rooms
      for (const id of selectedRooms) {
        if (!MULTI_ROOMS.includes(id as MultiRoomId) && roomData[id]) {
          ambientesObj[id] = roomData[id];
        }
      }
      const projeto: ArchiaProjetoUnificado = {
        id: existing?.id ?? crypto.randomUUID(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cliente: {
          nome: s1.cliente,
          localizacao: s1.local,
          moradores: s1.moradores,
          pet: s1.pet,
          perfilEstetico: { tomNeutro: s1.tomNeutro, corQueGosta: s1.corQueGosta, corQueNaoQuer: s1.corQueNaoQuer },
          referenciasVisuais: linksValidos,
        },
        projeto: { tipo: s1.tipoDetalhado, area: s1.area, orcamento: s1.orcamento, prazo: s1.prazo },
        ambientes: ambientesObj,
        ambientesOrdem: allInstanceIds,
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Briefing técnico</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Preencha por ambiente — a IA gera o briefing em formato de checklist
          </p>
        </div>
        <ClientLinkButton />
      </div>

      <ClientDataBanner onLoad={handleLoadClientData} />
      <ProjectSelector projetoId={projetoId} onChange={handleSelectProject} />
      <Stepper step={step} />

      {/* ── PASSO 1 ─────────────────────────────────── */}
      {step === 1 && (
        <div>
          <AutoFillBriefing onFill={(data) => {
            setS1((prev) => ({
              ...prev,
              ...(data.cliente       ? { cliente:       data.cliente }       : {}),
              ...(data.tipoDetalhado ? { tipoDetalhado: data.tipoDetalhado } : {}),
              ...(data.local         ? { local:         data.local }         : {}),
              ...(data.area          ? { area:          data.area }          : {}),
              ...(data.orcamento     ? { orcamento:     data.orcamento }     : {}),
              ...(data.prazo         ? { prazo:         data.prazo }         : {}),
              ...(data.moradores     ? { moradores:     data.moradores }     : {}),
              ...(data.obsGerais     ? { obsGerais:     data.obsGerais }     : {}),
            }));
          }} />
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Tipo de projeto</p>
          <div className="grid grid-cols-5 gap-2 mb-7">
            {TIPOS_PROJETO.map((t) => {
              const active = s1.tipoDetalhado === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setS1((prev) => ({ ...prev, tipoDetalhado: t.id }))}
                  className="flex flex-col items-center text-center p-3 rounded-xl transition-all"
                  style={{ border: active ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)", background: active ? "var(--accent-light)" : "var(--surface)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
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
            <FormGroup label="Orçamento disponível (R$)">
              <Input placeholder="Ex: R$ 250.000 ou 'a definir'" value={s1.orcamento} onChange={setS1Field("orcamento")} />
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

          <div className="mt-7">
            <SectionDivider>Perfil estético</SectionDivider>
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Tom neutro preferido">
                <Select value={s1.tomNeutro} onChange={setS1Field("tomNeutro")}>
                  <option value="">—</option>
                  <option>Cinza</option><option>Bege</option><option>Sem preferência</option>
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

          <div className="mt-7">
            <SectionDivider>Referências visuais</SectionDivider>
            <FormGroup label="Links de referência (opcional)" full>
              <MultiLinkField
                links={s1.referenciasVisuais}
                onChange={(links) => setS1((prev) => ({ ...prev, referenciasVisuais: links }))}
              />
            </FormGroup>
          </div>

          <div className="mt-7">
            <SectionDivider>Modelo de briefing do escritório</SectionDivider>
            <FormGroup label="Cole um briefing anterior como modelo (opcional)" full>
              <Textarea
                placeholder={`Cole aqui o texto de um briefing seu anterior — do Word, PDF ou e-mail. A IA vai seguir a mesma estrutura, formato e tom, substituindo pelos dados deste novo projeto.\n\nEx: "BRIEFING TÉCNICO — Residência XYZ\n\nSALA DE ESTAR\n• Estilo: Contemporâneo...\n• Piso: porcelanato 120x60..."`}
                value={s1.modeloBriefing}
                onChange={setS1Field("modeloBriefing")}
                style={{ minHeight: 140 }}
              />
              <FileUploadField onExtracted={(text) => setS1((prev) => ({ ...prev, modeloBriefing: text }))} />
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

      {/* ── PASSO 2 ─────────────────────────────────── */}
      {step === 2 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Quais ambientes fazem parte do projeto?</p>
          <div className="flex flex-col gap-2 mb-7">
            {ROOMS.map((room) => {
              const checked = selectedRooms.includes(room.id);
              const qty = roomQuantities[room.id] ?? 1;
              return (
                <div key={room.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ border: checked ? "1.5px solid var(--accent)" : "0.5px solid var(--border-strong)", background: checked ? "var(--accent-light)" : "var(--surface)" }}>
                  {/* Checkbox */}
                  <button type="button" onClick={() => toggleRoom(room.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: checked ? "var(--accent)" : "transparent", border: checked ? "none" : "1.5px solid var(--border-strong)" }}>
                      {checked && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>}
                    </div>
                    <span className="text-[13px]" style={{ color: checked ? "var(--accent)" : "var(--ink2)", fontWeight: checked ? 500 : 400 }}>
                      {room.label}
                    </span>
                  </button>

                  {/* Quantity selector for multi rooms */}
                  {room.multi && checked && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px]" style={{ color: "var(--accent)" }}>Qtd:</span>
                      <button type="button"
                        onClick={() => setRoomQty(room.id, qty - 1)}
                        disabled={qty <= 1}
                        style={{ width: 24, height: 24, borderRadius: 6, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", fontSize: 14, cursor: qty > 1 ? "pointer" : "not-allowed", opacity: qty <= 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
                        −
                      </button>
                      <span className="text-[13px] font-medium w-4 text-center" style={{ color: "var(--accent)" }}>{qty}</span>
                      <button type="button"
                        onClick={() => setRoomQty(room.id, qty + 1)}
                        disabled={qty >= 6}
                        style={{ width: 24, height: 24, borderRadius: 6, border: "0.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink2)", fontSize: 14, cursor: qty < 6 ? "pointer" : "not-allowed", opacity: qty >= 6 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
                        +
                      </button>
                      {qty > 1 && (
                        <span className="text-[10px] ml-1" style={{ color: "var(--ink3)" }}>
                          → {Array.from({ length: qty }, (_, i) => `${room.label} ${i + 1}`).join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {allInstanceIds.length > 0 && (
            <p className="text-xs mb-4" style={{ color: "var(--ink3)" }}>
              {allInstanceIds.length} {allInstanceIds.length === 1 ? "ambiente selecionado" : "ambientes selecionados"}
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

      {/* ── PASSO 3 ─────────────────────────────────── */}
      {step === 3 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--ink3)" }}>Detalhes por ambiente</p>
          {allInstanceIds.map((fullId) => (
            <RoomForm
              key={fullId}
              fullId={fullId}
              label={instanceLabel(fullId, roomData[fullId])}
              data={roomData[fullId] ?? emptyRoom()}
              onChange={(updated) => setRoomData((prev) => ({ ...prev, [fullId]: updated }))}
            />
          ))}
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
    </div>
  );
}
