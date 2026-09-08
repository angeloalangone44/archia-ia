"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAllReferencias,
  saveReferencia,
  deleteReferencia,
  emptyReferencia,
  fileToDataUrl,
  type Referencia,
} from "@/lib/referencias-db";
import { getArchiaProjects, type ArchiaProjetoUnificado } from "@/lib/archia-project";

/* ─── helpers ──────────────────────────────────────────── */

function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
      style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink2)" }}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "var(--ink3)" }}>×</button>
      )}
    </span>
  );
}

/* ─── lightbox ──────────────────────────────────────────── */

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl"
        style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20, lineHeight: "36px" }}>
        ×
      </button>
    </div>
  );
}

/* ─── modal de edição ───────────────────────────────────── */

function ReferenciaModal({
  inicial,
  projetos,
  onSave,
  onClose,
}: {
  inicial: Referencia;
  projetos: ArchiaProjetoUnificado[];
  onSave: (r: Referencia) => void;
  onClose: () => void;
}) {
  const [r, setR] = useState<Referencia>(inicial);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof Referencia>(k: K, v: Referencia[K]) {
    setR((prev) => ({ ...prev, [k]: v }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || r.tags.includes(t)) { setTagInput(""); return; }
    set("tags", [...r.tags, t]);
    setTagInput("");
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const novas = await Promise.all(
      Array.from(files).map(async (f) => ({
        id: crypto.randomUUID(),
        dataUrl: await fileToDataUrl(f),
        nome: f.name,
      }))
    );
    set("imagens", [...r.imagens, ...novas]);
  }

  async function handleSave() {
    if (!r.titulo.trim()) return alert("Informe um título.");
    setSaving(true);
    await saveReferencia(r);
    onSave(r);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>
            {inicial.titulo ? "Editar referência" : "Nova referência"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink3)", fontSize: 18 }}>×</button>
        </div>

        {/* título */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Título *</label>
        <input value={r.titulo} onChange={(e) => set("titulo", e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
          placeholder="Ex: Cozinha minimalista — referência para cliente Souza" />

        {/* tags */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Tags / categorias</label>
        <div className="flex gap-2 mb-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className="flex-1 rounded-lg px-3 py-2 text-[13px]"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
            placeholder="Ex: cozinha, minimalista..." />
          <button onClick={addTag}
            className="px-3 py-2 rounded-lg text-[12px]"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            + Adicionar
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {r.tags.map((t) => (
            <TagChip key={t} tag={t} onRemove={() => set("tags", r.tags.filter((x) => x !== t))} />
          ))}
        </div>

        {/* projeto vinculado */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Projeto vinculado (opcional)</label>
        <select value={r.projetoId ?? ""} onChange={(e) => set("projetoId", e.target.value || undefined)}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
          <option value="">Nenhum</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>{p.cliente.nome} — {p.projeto.tipo || "projeto"}</option>
          ))}
        </select>

        {/* imagens */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Imagens</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {r.imagens.map((img) => (
            <div key={img.id} className="relative group w-16 h-16 rounded-lg overflow-hidden"
              style={{ border: "0.5px solid var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={img.nome} className="w-full h-full object-cover" />
              <button
                onClick={() => set("imagens", r.imagens.filter((x) => x.id !== img.id))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer" }}>
                ×
              </button>
            </div>
          ))}
          <button onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-lg flex items-center justify-center text-[11px]"
            style={{ background: "var(--surface2)", border: "1px dashed var(--border)", color: "var(--ink3)", cursor: "pointer" }}>
            + foto
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => handleFiles(e.target.files)} />
        <p className="text-[10px] mb-4" style={{ color: "var(--ink3)" }}>
          ⚖️ Você é responsável pelos direitos de uso das imagens que enviar aqui.
        </p>

        {/* link */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Link de origem (opcional)</label>
        <input value={r.link} onChange={(e) => set("link", e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-4"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
          placeholder="https://pinterest.com/..." />

        {/* nota */}
        <label className="block text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Nota</label>
        <textarea value={r.nota} onChange={(e) => set("nota", e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-[13px] mb-5"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", resize: "vertical", fontFamily: "'DM Sans',sans-serif" }}
          placeholder="Observações sobre esta referência..." />

        <div className="flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px]"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink2)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] text-white"
            style={{ background: "var(--gold)", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── card de referência ────────────────────────────────── */

function ReferenciaCard({
  ref: r,
  onEdit,
  onDelete,
  onLightbox,
}: {
  ref: Referencia;
  onEdit: () => void;
  onDelete: () => void;
  onLightbox: (src: string) => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
      {r.imagens.length > 0 && (
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(r.imagens.length, 3)}, 1fr)` }}>
          {r.imagens.slice(0, 3).map((img) => (
            <button key={img.id} onClick={() => onLightbox(img.dataUrl)}
              className="block overflow-hidden"
              style={{ background: "none", border: "none", padding: 0, cursor: "zoom-in", aspectRatio: "1/1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={img.nome} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="p-3">
        <p className="text-[13px] font-medium mb-1" style={{ color: "var(--ink)" }}>{r.titulo}</p>
        {r.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {r.tags.map((t) => <TagChip key={t} tag={t} />)}
          </div>
        )}
        {r.nota && <p className="text-[11px] mb-2 line-clamp-2" style={{ color: "var(--ink3)" }}>{r.nota}</p>}
        <div className="flex gap-2 mt-2">
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
          {r.link && (
            <a href={r.link} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-[11px] px-2 py-1 rounded-lg"
              style={{ color: "var(--ink3)", textDecoration: "none" }}>
              ↗ Origem
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── página principal ──────────────────────────────────── */

export default function ReferenciasPage() {
  const [refs, setRefs] = useState<Referencia[]>([]);
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  const [modal, setModal] = useState<Referencia | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState("");
  const [filterProjeto, setFilterProjeto] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setRefs(await getAllReferencias());
    setLoading(false);
  }

  useEffect(() => {
    load();
    setProjetos(getArchiaProjects());
  }, []);

  async function handleSave(r: Referencia) {
    setModal(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta referência?")) return;
    await deleteReferencia(id);
    await load();
  }

  // coletar todas as tags únicas
  const allTags = Array.from(new Set(refs.flatMap((r) => r.tags))).sort();

  const filtered = refs.filter((r) => {
    if (filterTag && !r.tags.includes(filterTag)) return false;
    if (filterProjeto && r.projetoId !== filterProjeto) return false;
    return true;
  });

  return (
    <div className="p-7 max-w-5xl">
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {modal && (
        <ReferenciaModal
          inicial={modal}
          projetos={projetos}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Referências / Moodboard</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Imagens e links de inspiração para seus projetos
          </p>
        </div>
        <button
          onClick={() => setModal(emptyReferencia())}
          className="px-4 py-2 rounded-xl text-[13px] text-white"
          style={{ background: "var(--gold)", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          + Nova referência
        </button>
      </div>

      {/* filtros */}
      {(allTags.length > 0 || projetos.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-5">
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-[12px]"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
            <option value="">Todas as tags</option>
            {allTags.map((t) => <option key={t}>{t}</option>)}
          </select>
          {projetos.length > 0 && (
            <select value={filterProjeto} onChange={(e) => setFilterProjeto(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[12px]"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
              <option value="">Todos os projetos</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.cliente.nome}</option>
              ))}
            </select>
          )}
          {(filterTag || filterProjeto) && (
            <button onClick={() => { setFilterTag(""); setFilterProjeto(""); }}
              className="px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: "none", border: "0.5px solid var(--border)", color: "var(--ink3)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {loading && (
        <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Carregando...</p>
      )}

      {!loading && refs.length === 0 && (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface2)", border: "1px dashed var(--border)" }}>
          <p className="text-[13px] mb-1" style={{ color: "var(--ink2)" }}>Nenhuma referência ainda</p>
          <p className="text-[11px]" style={{ color: "var(--ink3)" }}>
            Salve imagens e links de inspiração para consultar durante os projetos.
          </p>
        </div>
      )}

      {!loading && filtered.length === 0 && refs.length > 0 && (
        <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Nenhuma referência com esses filtros.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {filtered.map((r) => (
          <ReferenciaCard
            key={r.id}
            ref={r}
            onEdit={() => setModal(r)}
            onDelete={() => handleDelete(r.id)}
            onLightbox={setLightbox}
          />
        ))}
      </div>
    </div>
  );
}
