"use client";

import TemplateRenderer, { TemaPickerCompact } from "@/components/TemplateRenderer";
import type { TemaDocumento } from "@/lib/pdf-themes";
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
  type MóvelItem,
  type ArchiaProjetoUnificado,
} from "@/lib/archia-project";
import { getConfiguracoesOrDefault } from "@/lib/configuracoes";

/* ── itens personalizados (localStorage) ────────────────── */

const CUSTOM_ITEMS_KEY = "archia_custom_items";

function loadCustomItems(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CUSTOM_ITEMS_KEY) ?? "{}"); } catch { return {}; }
}

function saveCustomItem(ambienteBase: string, item: string) {
  const all = loadCustomItems();
  const existing = all[ambienteBase] ?? [];
  if (!existing.includes(item)) {
    all[ambienteBase] = [...existing, item];
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(all));
  }
}

function removeCustomItem(ambienteBase: string, item: string) {
  const all = loadCustomItems();
  all[ambienteBase] = (all[ambienteBase] ?? []).filter((i) => i !== item);
  localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(all));
}

/* ── constantes ─────────────────────────────────────────── */

/* ── templates de briefing ──────────────────────────────── */

const BRIEFING_TEMPLATES = [
  {
    id: "checklist",
    label: "Checklist técnico",
    desc: "Por ambiente · especificações detalhadas",
    icon: "✅",
    color: "#2374AB",
    bg: "#EBF5FB",
    conteudo: `MODELO DE BRIEFING — Checklist técnico por ambiente

Para cada ambiente, registre:
• Estilo desejado (clean, clássico, moderno, rústico, industrial)
• Revestimento de piso e paredes
• Iluminação (direta / indireta / mista)
• Tom de madeira preferido
• Itens desejados (TV, lareira, bancada, etc.)
• Mobiliário a reaproveitar
• Mobiliário novo necessário
• Observações específicas

Inclua ao final:
• Perfil estético do cliente (cores, referências)
• Restrições (orçamento, prazo, condicionantes físicas)
• Próximas etapas recomendadas
• Especificações preliminares por ambiente (tabela de materiais)`,
    exemplo: `# BRIEFING TÉCNICO — Apartamento 120m² · Pinheiros

**Cliente:** Carlos e Ana Mendes
**Data:** 10/06/2025

## INFORMAÇÕES GERAIS
- **Tipo:** Residencial · Apartamento
- **Área:** 120 m²
- **Orçamento:** R$ 350.000
- **Prazo:** 8 meses

---

## SALA DE ESTAR / JANTAR
- **Estilo:** Contemporâneo com toques orgânicos
- **Piso:** Porcelanato 120×60 tom cinza claro
- **Parede:** Tinta + painel ripado em nogueira na parede da TV
- **Iluminação:** Indireta com sanca + spots direcionáveis
- **Itens:** Lareira a etanol, adega embutida
- **Observações:** Integrar sala com cozinha, mesa para 8 pessoas

## COZINHA
- **Estilo:** Clean, sem puxadores
- **Bancada:** Porcelanato marmorizado
- **Metal:** Preto fosco
- **Eletros:** Cooktop a gás 5 bocas, forno embutido, geladeira side-by-side

---

## PRÓXIMAS ETAPAS
1. Aprovação do estudo preliminar
2. Apresentação de moodboard de materiais
3. Início do projeto executivo`,
  },
  {
    id: "resumo-executivo",
    label: "Resumo executivo + checklist",
    desc: "Resumo p/ o cliente · checklist p/ o arquiteto",
    icon: "📄",
    color: "#2D5A3D",
    bg: "#EAF2EC",
    conteudo: `MODELO DE BRIEFING — Resumo executivo + Checklist técnico

## PARTE 1: RESUMO EXECUTIVO (para compartilhar com o cliente)
Texto em linguagem simples resumindo o que foi acordado:
• O que será feito
• Estilo e conceito geral do projeto
• Destaques e pedidos especiais do cliente
• Próximos passos

[Nota: Esta seção pode ser enviada ao cliente para validação antes de avançar]

---

## PARTE 2: CHECKLIST TÉCNICO (uso interno do arquiteto)
Por ambiente, registre:
• Decisões confirmadas de revestimento, iluminação e mobiliário
• Itens a definir (⚠)
• Especificações técnicas (dimensões, normas, materiais)
• Observações de instalação

Inclua ao final:
• Especificações preliminares (tabela por ambiente)
• Pendências e próximas etapas`,
    exemplo: `# BRIEFING — Residência Mendes
**Apartamento 120m² · Pinheiros, SP**

---

## RESUMO PARA O CLIENTE

Carlos e Ana, reunimos aqui tudo que conversamos. Por favor confirme se está correto antes de avançarmos para o projeto.

**O que faremos:**
Projeto de interiores completo para o seu apartamento. O conceito é um ambiente contemporâneo com toques orgânicos — confortável para o dia a dia e elegante para receber.

**Ambientes:** Sala integrada, cozinha americana, 2 quartos, 2 banheiros e varanda gourmet.

**Destaques que vocês pediram:**
- Sala integrada com cozinha aberta
- Mesa para 8 pessoas
- Lareira a etanol
- Tons neutros com destaque em madeira nogueira

Qualquer ajuste, me falem! ✉

---

## CHECKLIST TÉCNICO (uso interno)

### SALA DE ESTAR / JANTAR
- ✅ **Piso:** Porcelanato 120×60 · tom cinza claro
- ✅ **Parede TV:** Painel ripado em nogueira
- ✅ **Iluminação:** Indireta com sanca
- ⚠ **Sofá:** Dimensões a definir após aprovação do layout`,
  },
];

/* ── cards de templates de briefing ────────────────────── */

function TemplatesBriefingCards({ onSelect }: { onSelect: (conteudo: string) => void }) {
  const [preview, setPreview] = useState<typeof BRIEFING_TEMPLATES[0] | null>(null);
  return (
    <div className="mb-4">
      <p className="text-[12px] mb-3" style={{ color: "var(--ink3)" }}>
        Ou escolha um template como ponto de partida:
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {BRIEFING_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="rounded-xl p-3.5 flex flex-col gap-2.5"
            style={{ border: `0.5px solid ${tpl.color}33`, background: tpl.bg }}>
            <div className="flex items-start gap-2">
              <span className="text-lg">{tpl.icon}</span>
              <div>
                <p className="text-[12px] font-medium leading-tight" style={{ color: tpl.color }}>{tpl.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: tpl.color, opacity: 0.7 }}>{tpl.desc}</p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-auto">
              <button type="button" onClick={() => onSelect(tpl.conteudo)}
                className="flex-1 text-[11px] py-1.5 rounded-lg font-medium"
                style={{ background: tpl.color, color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Usar
              </button>
              <button type="button" onClick={() => setPreview(tpl)}
                className="text-[11px] py-1.5 px-2.5 rounded-lg"
                style={{ background: "transparent", border: `0.5px solid ${tpl.color}55`, color: tpl.color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Ver exemplo
              </button>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div style={{ background: "var(--surface)", borderRadius: 16, maxWidth: 640, width: "100%", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <span>{preview.icon}</span>
                <span className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>{preview.label}</span>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 18 }}>✕</button>
            </div>
            <div className="overflow-y-auto p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--ink3)" }}>Exemplo com dados fictícios</p>
              <div className="rounded-xl p-5 text-[12px] leading-relaxed whitespace-pre-wrap"
                style={{ background: preview.bg, border: `0.5px solid ${preview.color}22`, color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}>
                {preview.exemplo}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

/* ── upload de imagens de referência ────────────────────── */

const MAX_REF_IMAGES = 8;
const MAX_IMG_SIZE = 3 * 1024 * 1024;

type RefImage = { id: string; base64: string; mediaType: string; name: string; previewUrl: string };

function ImageUploadRef({
  images,
  analysis,
  analyzing,
  error,
  onAdd,
  onRemove,
}: {
  images: RefImage[];
  analysis: string | null;
  analyzing: boolean;
  error: string | null;
  onAdd: (imgs: RefImage[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_REF_IMAGES - images.length;
    const valid = files.slice(0, remaining).filter((f) => f.size <= MAX_IMG_SIZE && /^image\/(jpeg|png|webp)$/.test(f.type));
    if (!valid.length) return;
    Promise.all(
      valid.map(
        (f) =>
          new Promise<RefImage>((res) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              res({ id: crypto.randomUUID(), base64: dataUrl.split(",")[1], mediaType: f.type, name: f.name, previewUrl: dataUrl });
            };
            reader.readAsDataURL(f);
          }),
      ),
    ).then((newImgs) => onAdd(newImgs));
    e.target.value = "";
  }

  return (
    <div>
      {/* upload area */}
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((img) => (
          <div key={img.id} className="relative group" style={{ width: 72, height: 72 }}>
            <img src={img.previewUrl} alt={img.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "0.5px solid var(--border-strong)" }} />
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center text-[10px]"
              style={{ background: "#DC2626", color: "#fff", border: "none", cursor: "pointer" }}>
              ×
            </button>
          </div>
        ))}
        {images.length < MAX_REF_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 rounded-xl transition-colors hover:opacity-70"
            style={{ width: 72, height: 72, border: "0.5px dashed var(--border-strong)", background: "var(--surface2)", cursor: "pointer", color: "var(--ink3)", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"><path d="M12 4v16m8-8H4"/></svg>
            <span style={{ fontSize: 10 }}>Foto</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFiles} />

      {/* analysis result */}
      {analyzing && (
        <div className="flex items-center gap-2 text-[12px] px-3 py-2.5 rounded-xl mb-2" style={{ background: "var(--surface2)", color: "var(--ink3)" }}>
          <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }} />
          Analisando imagens com IA...
        </div>
      )}

      {!analyzing && error && (
        <div className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-xl mb-2" style={{ background: "#FDEDEC", color: "#C0392B", border: "0.5px solid #F5B7B1" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          {error}
        </div>
      )}

      {!analyzing && analysis && (
        <div className="rounded-xl p-3.5 mb-2" style={{ background: "var(--surface2)", border: "0.5px solid var(--border-strong)" }}>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>
            📸 O que identificamos nas suas referências:
          </p>
          <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
            {analysis}
          </p>
        </div>
      )}

      {/* privacy notice */}
      <p className="text-[11px] leading-relaxed" style={{ color: "var(--ink3)" }}>
        As imagens são analisadas para gerar este relatório e não são armazenadas. Máx. {MAX_REF_IMAGES} imagens · JPG, PNG ou WebP · até 3MB cada.
      </p>
    </div>
  );
}

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

/* ── itens desejados com personalização ─────────────────── */

function ItensDesejados({ ambienteBase, data, defaultItems, onChange }: {
  ambienteBase: string;
  data: RoomFields;
  defaultItems: string[];
  onChange: (updated: RoomFields) => void;
}) {
  const [customItems, setCustomItems] = useState<string[]>(() => {
    const all = loadCustomItems();
    return all[ambienteBase] ?? [];
  });
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = [...defaultItems, ...customItems];

  function toggleItem(item: string) {
    const cur = data.itens;
    onChange({ ...data, itens: cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item] });
  }

  function handleAddItem() {
    const val = newItem.trim();
    if (!val) return;
    saveCustomItem(ambienteBase, val);
    setCustomItems((prev) => prev.includes(val) ? prev : [...prev, val]);
    onChange({ ...data, itens: [...data.itens, val] });
    setNewItem("");
    setAdding(false);
  }

  function handleRemoveCustom(item: string) {
    removeCustomItem(ambienteBase, item);
    setCustomItems((prev) => prev.filter((i) => i !== item));
    onChange({ ...data, itens: data.itens.filter((i) => i !== item) });
  }

  if (allItems.length === 0 && !adding) return (
    <div className="py-2" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <button type="button" onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="text-[12px] px-3 py-1 rounded-full"
        style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px dashed var(--border-strong)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
        + Adicionar item desejado
      </button>
    </div>
  );

  return (
    <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <p className="text-[12px] mb-2.5" style={{ color: "var(--ink3)" }}>Itens desejados</p>
      <div className="flex flex-wrap gap-2">
        {allItems.map((item) => {
          const checked = data.itens.includes(item);
          const isCustom = customItems.includes(item);
          return (
            <div key={item} className="relative group">
              <button type="button" onClick={() => toggleItem(item)}
                className="text-[12px] px-3 py-1 rounded-full transition-colors"
                style={{ background: checked ? "var(--accent)" : "var(--surface2)", color: checked ? "#fff" : "var(--ink2)", border: checked ? "0.5px solid var(--accent)" : "0.5px solid var(--border-strong)", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", paddingRight: isCustom ? 20 : undefined }}>
                {checked ? "✓ " : ""}{item}
              </button>
              {isCustom && (
                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveCustom(item); }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center text-[9px]"
                  style={{ background: "#DC2626", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Outros chip */}
        {adding ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddItem(); } if (e.key === "Escape") { setAdding(false); setNewItem(""); } }}
              placeholder="Nome do item..."
              className="text-[12px] px-3 py-1 rounded-full outline-none"
              style={{ border: "1.5px solid var(--accent)", background: "var(--accent-light)", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", width: 160 }}
            />
            <button type="button" onClick={handleAddItem}
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{ background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              OK
            </button>
            <button type="button" onClick={() => { setAdding(false); setNewItem(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 14 }}>×</button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="text-[12px] px-3 py-1 rounded-full"
              style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px dashed var(--border-strong)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              + Adicionar
            </button>
            <button type="button" onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="text-[12px] px-3 py-1 rounded-full"
              style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px solid var(--border-strong)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Outros
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── detalhamento de móveis a manter ────────────────────── */

const INTERVENCOES_OPTIONS = ["Lavar/limpar", "Reformar/restaurar", "Pintar", "Reestofar", "Nenhuma — está em bom estado"];

function MóvelItemForm({ item, onChange, onRemove }: {
  item: MóvelItem;
  onChange: (updated: MóvelItem) => void;
  onRemove: () => void;
}) {
  const fotoRef = useRef<HTMLInputElement>(null);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || f.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ ...item, fotoBase64: ev.target?.result as string });
    reader.readAsDataURL(f);
  }

  function toggleIntervencao(opt: string) {
    const cur = item.intervencoes;
    onChange({ ...item, intervencoes: cur.includes(opt) ? cur.filter((i) => i !== opt) : [...cur, opt] });
  }

  return (
    <div className="mt-3 rounded-xl p-4" style={{ border: "0.5px solid var(--border-strong)", background: "var(--surface2)" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <Input
          placeholder="Nome/descrição — ex: Sofá de 3 lugares cinza"
          value={item.descricao}
          onChange={(e) => onChange({ ...item, descricao: e.target.value })}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 16, flexShrink: 0, paddingTop: 6 }}>×</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Medidas</p>
          <Input
            placeholder="Ex: 2,20m × 0,90m"
            value={item.medidas}
            onChange={(e) => onChange({ ...item, medidas: e.target.value })}
          />
        </div>
        <div>
          <p className="text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Foto (opcional)</p>
          {item.fotoBase64 ? (
            <div className="flex items-center gap-2">
              <img src={item.fotoBase64} alt="Foto do móvel" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
              <button type="button" onClick={() => { onChange({ ...item, fotoBase64: undefined }); }}
                className="text-[11px]" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontFamily: "'DM Sans', sans-serif" }}>
                Remover
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fotoRef.current?.click()}
              className="w-full h-10 rounded-xl flex items-center justify-center gap-1.5 text-[11px]"
              style={{ border: "0.5px dashed var(--border-strong)", background: "var(--surface)", cursor: "pointer", color: "var(--ink3)", fontFamily: "'DM Sans', sans-serif" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><path d="M12 4v16m8-8H4"/></svg>
              Enviar foto
            </button>
          )}
          <input ref={fotoRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFoto} />
        </div>
      </div>

      <p className="text-[11px] mb-1.5" style={{ color: "var(--ink3)" }}>Necessita intervenção?</p>
      <div className="flex flex-wrap gap-2">
        {INTERVENCOES_OPTIONS.map((opt) => {
          const checked = item.intervencoes.includes(opt);
          return (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-[11px]"
              style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
              <input type="checkbox" checked={checked} onChange={() => toggleIntervencao(opt)}
                style={{ accentColor: "var(--accent)", cursor: "pointer", width: 12, height: 12 }} />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MoveisExistentes({ fullId, data, onChange }: {
  fullId: string;
  data: RoomFields;
  onChange: (updated: RoomFields) => void;
}) {
  function addMovel() {
    const novo: MóvelItem = { id: crypto.randomUUID(), descricao: "", medidas: "", intervencoes: [] };
    onChange({ ...data, moveisDetalhados: [...(data.moveisDetalhados ?? []), novo] });
  }

  function updateMovel(idx: number, updated: MóvelItem) {
    const arr = [...(data.moveisDetalhados ?? [])];
    arr[idx] = updated;
    onChange({ ...data, moveisDetalhados: arr });
  }

  function removeMovel(idx: number) {
    const arr = (data.moveisDetalhados ?? []).filter((_, i) => i !== idx);
    onChange({ ...data, moveisDetalhados: arr });
  }

  return (
    <div className="py-2.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <p className="text-[12px] mb-2" style={{ color: "var(--ink3)" }}>Algum móvel / item existente deve ser mantido?</p>
      <div className="flex gap-5 mb-2">
        {["Sim", "Não"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px]"
            style={{ color: "var(--ink2)", fontFamily: "'DM Sans', sans-serif" }}>
            <input type="radio" name={`aproveitarMoveis-${fullId}`} value={opt}
              checked={data.aproveitarMoveis === opt}
              onChange={() => onChange({ ...data, aproveitarMoveis: opt, moveisDetalhados: opt === "Não" ? [] : data.moveisDetalhados })}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
            {opt}
          </label>
        ))}
      </div>

      {data.aproveitarMoveis === "Sim" && (
        <div>
          {(data.moveisDetalhados ?? []).map((movel, idx) => (
            <MóvelItemForm key={movel.id} item={movel}
              onChange={(u) => updateMovel(idx, u)}
              onRemove={() => removeMovel(idx)} />
          ))}
          <button type="button" onClick={addMovel}
            className="mt-3 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-xl"
            style={{ background: "var(--surface2)", border: "0.5px dashed var(--border-strong)", color: "var(--accent)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M12 4v16m8-8H4"/></svg>
            Adicionar móvel
          </button>
        </div>
      )}
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
          {/* Texto livre complementar ao estilo */}
          <div className="py-1.5">
            <Textarea
              placeholder="Descreva com suas palavras (opcional) — ex: quero algo entre industrial e aconchegante, com toques vintage..."
              value={data.estiloTexto ?? ""}
              onChange={(e) => onChange({ ...data, estiloTexto: e.target.value })}
              style={{ minHeight: 44, fontSize: 12 }}
            />
          </div>
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
          <ItensDesejados
            ambienteBase={base}
            data={data}
            defaultItems={items}
            onChange={onChange}
          />

          {/* Móveis existentes */}
          <MoveisExistentes fullId={fullId} data={data} onChange={onChange} />

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
      d.estiloTexto           && `• Estilo (detalhamento): ${d.estiloTexto}`,
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
      d.aproveitarMoveis && `• Móveis existentes: ${d.aproveitarMoveis}`,
      d.aproveitarMoveis === "Sim" && (d.moveisDetalhados ?? []).length > 0 &&
        `• Móveis a manter:\n${(d.moveisDetalhados ?? []).map((m) => `  - ${m.descricao}${m.medidas ? ` (${m.medidas})` : ""}${m.intervencoes.length ? ` — ${m.intervencoes.join(", ")}` : ""}`).join("\n")}`,
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

  const [temaDocumento, setTemaDocumento] = useState<TemaDocumento>("classico");
  const [refImages, setRefImages] = useState<RefImage[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [analyzingImages, setAnalyzingImages] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(BRIEFING_MODEL_KEY);
    if (saved) setS1((prev) => ({ ...prev, modeloBriefing: saved }));
    const cfg = getConfiguracoesOrDefault();
    if (cfg.temaDocumento) setTemaDocumento(cfg.temaDocumento);
  }, []);

  useEffect(() => {
    localStorage.setItem(BRIEFING_MODEL_KEY, s1.modeloBriefing);
  }, [s1.modeloBriefing]);

  async function handleImagesAdd(newImgs: RefImage[]) {
    const next = [...refImages, ...newImgs];
    setRefImages(next);
    if (next.length === 0) { setImageAnalysis(null); return; }
    setAnalyzingImages(true);
    setImageAnalysisError(null);
    try {
      const res = await fetch("/api/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next.map((i) => ({ base64: i.base64, mediaType: i.mediaType })) }),
      });
      const json = await res.json() as { analysis?: string; error?: string };
      if (!res.ok || json.error) { setImageAnalysisError(json.error ?? "Erro ao analisar imagens."); }
      else setImageAnalysis(json.analysis ?? null);
    } catch { setImageAnalysisError("Não foi possível analisar as imagens."); }
    finally { setAnalyzingImages(false); }
  }

  async function handleImageRemove(id: string) {
    const next = refImages.filter((i) => i.id !== id);
    setRefImages(next);
    if (next.length === 0) { setImageAnalysis(null); setImageAnalysisError(null); return; }
    setAnalyzingImages(true);
    setImageAnalysisError(null);
    try {
      const res = await fetch("/api/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next.map((i) => ({ base64: i.base64, mediaType: i.mediaType })) }),
      });
      const json = await res.json() as { analysis?: string; error?: string };
      if (!res.ok || json.error) { setImageAnalysisError(json.error ?? "Erro ao analisar imagens."); }
      else setImageAnalysis(json.analysis ?? null);
    } catch { setImageAnalysisError("Não foi possível analisar as imagens."); }
    finally { setAnalyzingImages(false); }
  }

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
    if (data.analiseImagens) {
      setImageAnalysis(data.analiseImagens);
    }
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
      analiseImagens: imageAnalysis ?? "",
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
          <TemaPickerCompact selected={temaDocumento} onChange={setTemaDocumento} />

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
            <FormGroup label="Imagens de referência (opcional)" full>
              <ImageUploadRef
                images={refImages}
                analysis={imageAnalysis}
                analyzing={analyzingImages}
                error={imageAnalysisError}
                onAdd={handleImagesAdd}
                onRemove={handleImageRemove}
              />
            </FormGroup>
          </div>

          <div className="mt-7">
            <SectionDivider>Modelo de briefing do escritório</SectionDivider>
            <FormGroup label="Cole um briefing anterior como modelo (opcional)" full>
              <TemplatesBriefingCards onSelect={(c) => setS1((prev) => ({ ...prev, modeloBriefing: c }))} />
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

      <TemplateRenderer text={text} isStreaming={isLoading} visible={visible} temaDocumento={temaDocumento} onTemaChange={setTemaDocumento} />
    </div>
  );
}
