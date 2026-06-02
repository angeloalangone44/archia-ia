"use client";

import { useEffect, useState } from "react";
import {
  getCompromissos, saveCompromisso, deleteCompromisso, getUpcomingCount,
  type Compromisso, type CompromissoTipo,
  TIPO_LABEL, TIPO_COLOR, TIPO_BG, todayStr, relativeDay,
} from "@/lib/planner";
import { getProjects } from "@/lib/projects";
import type { Projeto } from "@/lib/projects";

/* ── constantes ─────────────────────────────────────────── */

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const TIPOS: CompromissoTipo[] = ["reuniao","prazo","followup","visita","meta"];

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function newId() { return crypto.randomUUID(); }

function blankForm(): Omit<Compromisso,"id"> {
  return { titulo:"", tipo:"reuniao", data:todayStr(), horario:"", clienteNome:"", projetoId:"", obs:"" };
}

/* ── Modal add/edit ─────────────────────────────────────── */

function Modal({ editing, projetos, onSave, onDelete, onClose }: {
  editing: Compromisso | null;
  projetos: Projeto[];
  onSave: (c: Compromisso) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<Omit<Compromisso,"id">>(editing ? { ...editing } : blankForm());
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  function handleProjetoChange(projetoId: string) {
    const proj = projetos.find(p => p.id === projetoId);
    setF(p => ({ ...p, projetoId, clienteNome: proj ? proj.nome : p.clienteNome }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.titulo.trim() || !f.data) return;
    onSave({ ...f, id: editing?.id ?? newId() });
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"var(--bg)", borderRadius:16, padding:"24px 28px", width:"100%", maxWidth:480, boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium" style={{ color:"var(--ink)" }}>
            {editing ? "Editar compromisso" : "Novo compromisso"}
          </h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink3)", fontSize:18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Título */}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Título *</label>
            <input value={f.titulo} onChange={e=>set("titulo",e.target.value)} required
              placeholder="Ex: Reunião com Ana Camargo"
              style={{ width:"100%", fontSize:13, padding:"8px 10px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t=>(
                <button key={t} type="button" onClick={()=>set("tipo",t)}
                  style={{
                    fontSize:11, padding:"4px 10px", borderRadius:20, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    background: f.tipo===t ? TIPO_BG[t] : "var(--surface2)",
                    color: f.tipo===t ? TIPO_COLOR[t] : "var(--ink3)",
                    border: f.tipo===t ? `1px solid ${TIPO_COLOR[t]}40` : "0.5px solid var(--border)",
                  }}>
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Data */}
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Data *</label>
              <input type="date" required value={f.data} onChange={e=>set("data",e.target.value)}
                style={{ width:"100%", fontSize:13, padding:"7px 10px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
            </div>
            {/* Horário */}
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Horário</label>
              <input type="time" value={f.horario} onChange={e=>set("horario",e.target.value)}
                style={{ width:"100%", fontSize:13, padding:"7px 10px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
            </div>
          </div>

          {/* Cliente vinculado */}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Cliente vinculado</label>
            <select value={f.projetoId} onChange={e=>handleProjetoChange(e.target.value)}
              style={{ width:"100%", fontSize:13, padding:"7px 10px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", fontFamily:"'DM Sans',sans-serif", outline:"none" }}>
              <option value="">Nenhum</option>
              {/* Unique client names */}
              {Array.from(new Map(projetos.map(p=>[p.nome,p])).values()).map(p=>(
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* Obs */}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color:"var(--ink3)" }}>Observações</label>
            <textarea value={f.obs} onChange={e=>set("obs",e.target.value)} rows={2}
              placeholder="Detalhes adicionais..."
              style={{ width:"100%", fontSize:13, padding:"7px 10px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", fontFamily:"'DM Sans',sans-serif", outline:"none", resize:"vertical" }} />
          </div>

          <div className="flex gap-2 justify-between pt-2">
            {editing && (
              <button type="button" onClick={()=>{ onDelete(editing.id); onClose(); }}
                style={{ fontSize:12, color:"#C0392B", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Excluir
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose}
                style={{ fontSize:13, padding:"8px 16px", borderRadius:8, border:"0.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--ink)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancelar
              </button>
              <button type="submit"
                style={{ fontSize:13, padding:"8px 18px", borderRadius:8, background:"var(--accent)", color:"#fff", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── EventChip ───────────────────────────────────────────── */

function EventChip({ c, onClick }: { c: Compromisso; onClick: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={c.titulo}
      style={{
        display:"block", width:"100%", textAlign:"left", fontSize:10,
        padding:"1px 5px", borderRadius:3, marginBottom:1, cursor:"pointer",
        background:TIPO_BG[c.tipo], color:TIPO_COLOR[c.tipo],
        border:"none", fontFamily:"'DM Sans',sans-serif",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
      }}>
      {c.horario && <span style={{ opacity:0.7 }}>{c.horario} · </span>}{c.titulo}
    </button>
  );
}

/* ── MonthView ───────────────────────────────────────────── */

function MonthView({ year, month, compromissos, onOpenEvent, onDayClick }: {
  year: number; month: number;
  compromissos: Compromisso[];
  onOpenEvent: (c: Compromisso) => void;
  onDayClick: (dateStr: string) => void;
}) {
  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month+1, 0).getDate();
  const cells: (number|null)[] = [];
  for (let i=0; i<firstDow; i++) cells.push(null);
  for (let d=1; d<=totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map(w=>(
          <div key={w} className="text-center text-[11px] py-1.5 font-medium" style={{ color:"var(--ink3)" }}>{w}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px" style={{ background:"var(--border)" }}>
        {cells.map((day, i) => {
          const dateStr = day ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : null;
          const dayEvents = dateStr ? compromissos.filter(c=>c.data===dateStr).sort((a,b)=>a.horario.localeCompare(b.horario)) : [];
          const isToday = day ? isSameDay(new Date(year,month,day), today) : false;
          return (
            <div key={i}
              onClick={()=>{ if(dateStr) onDayClick(dateStr); }}
              style={{
                background: day ? "var(--bg)" : "var(--surface)",
                minHeight:80, padding:"4px 4px 4px", cursor: day?"pointer":"default",
                opacity: day ? 1 : 0.4,
              }}>
              <div style={{
                width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, marginBottom:3, fontWeight: isToday ? 600 : 400,
                background: isToday ? "var(--accent)" : "transparent",
                color: isToday ? "#fff" : "var(--ink3)",
              }}>
                {day || ""}
              </div>
              {dayEvents.slice(0,3).map(e=>(
                <EventChip key={e.id} c={e} onClick={()=>onOpenEvent(e)} />
              ))}
              {dayEvents.length > 3 && (
                <div style={{ fontSize:10, color:"var(--ink3)", paddingLeft:4 }}>+{dayEvents.length-3}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── WeekView ────────────────────────────────────────────── */

function WeekView({ weekStart, compromissos, onOpenEvent, onDayClick }: {
  weekStart: Date;
  compromissos: Compromisso[];
  onOpenEvent: (c: Compromisso) => void;
  onDayClick: (dateStr: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-px" style={{ background:"var(--border)" }}>
      {days.map((day,i) => {
        const dateStr = fmtDate(day);
        const dayEvents = compromissos.filter(c=>c.data===dateStr).sort((a,b)=>a.horario.localeCompare(b.horario));
        const isToday = isSameDay(day, today);
        return (
          <div key={i} style={{ background:"var(--bg)", minHeight:180, padding:6, cursor:"pointer" }}
            onClick={()=>onDayClick(dateStr)}>
            <div style={{ marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:10, color:"var(--ink3)" }}>{WDAYS[day.getDay()]}</span>
              <span style={{
                fontSize:13, fontWeight: isToday ? 700 : 400,
                color: isToday ? "var(--accent)" : "var(--ink)",
              }}>{day.getDate()}</span>
            </div>
            {dayEvents.map(e=>(
              <EventChip key={e.id} c={e} onClick={()=>onOpenEvent(e)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── ListView ────────────────────────────────────────────── */

function ListView({ compromissos, onOpenEvent }: {
  compromissos: Compromisso[];
  onOpenEvent: (c: Compromisso) => void;
}) {
  const today = todayStr();
  const upcoming = compromissos.filter(c=>c.data>=today).sort((a,b)=>a.data.localeCompare(b.data)||a.horario.localeCompare(b.horario));
  const past = compromissos.filter(c=>c.data<today).sort((a,b)=>b.data.localeCompare(a.data));

  function renderGroup(list: Compromisso[], label: string) {
    if (!list.length) return null;
    const byDate = new Map<string, Compromisso[]>();
    for (const c of list) {
      if (!byDate.has(c.data)) byDate.set(c.data, []);
      byDate.get(c.data)!.push(c);
    }
    return (
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color:"var(--ink3)" }}>{label}</p>
        {Array.from(byDate.entries()).map(([date, evs]) => (
          <div key={date} className="mb-4">
            <p className="text-[12px] font-medium mb-2" style={{ color:"var(--ink2)" }}>{relativeDay(date)}</p>
            {evs.map(c=>(
              <button key={c.id} onClick={()=>onOpenEvent(c)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 mb-1.5 text-left transition-all hover:opacity-80"
                style={{ background:"var(--surface)", border:"0.5px solid var(--border)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:TIPO_COLOR[c.tipo] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color:"var(--ink)" }}>{c.titulo}</p>
                  {c.clienteNome && <p className="text-[11px]" style={{ color:"var(--ink3)" }}>{c.clienteNome}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {c.horario && <span className="text-[11px]" style={{ color:"var(--ink3)" }}>{c.horario}</span>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:TIPO_BG[c.tipo], color:TIPO_COLOR[c.tipo] }}>
                    {TIPO_LABEL[c.tipo]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!compromissos.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm font-medium mb-1" style={{ color:"var(--ink)" }}>Nenhum compromisso ainda</p>
        <p className="text-xs" style={{ color:"var(--ink3)" }}>Clique em "+ Novo compromisso" para começar</p>
      </div>
    );
  }

  return (
    <div>
      {renderGroup(upcoming, "Próximos")}
      {renderGroup(past, "Anteriores")}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

type View = "mes" | "semana" | "lista";

export default function PlannerPage() {
  const [view, setView] = useState<View>("mes");
  const [today] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Compromisso | null; defaultData?: string }>({ open:false, editing:null });
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    setCompromissos(getCompromissos());
    setProjetos(getProjects());
    setUpcomingCount(getUpcomingCount(7));
  }, []);

  function refresh() {
    setCompromissos(getCompromissos());
    setUpcomingCount(getUpcomingCount(7));
  }

  function handleSave(c: Compromisso) {
    saveCompromisso(c);
    setModal({ open:false, editing:null });
    refresh();
  }

  function handleDelete(id: string) {
    deleteCompromisso(id);
    refresh();
  }

  // Navigation
  function prevPeriod() {
    const d = new Date(currentDate);
    if (view === "mes") d.setMonth(d.getMonth()-1);
    else if (view === "semana") d.setDate(d.getDate()-7);
    setCurrentDate(d);
  }

  function nextPeriod() {
    const d = new Date(currentDate);
    if (view === "mes") d.setMonth(d.getMonth()+1);
    else if (view === "semana") d.setDate(d.getDate()+7);
    setCurrentDate(d);
  }

  // Week start (Sunday)
  const weekStart = new Date(currentDate);
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate()-dow);

  function periodLabel(): string {
    if (view === "mes") return `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === "semana") {
      const end = new Date(weekStart); end.setDate(end.getDate()+6);
      return `${weekStart.getDate()} – ${end.getDate()} ${MONTHS_PT[end.getMonth()].slice(0,3)} ${end.getFullYear()}`;
    }
    return "Todos os compromissos";
  }

  return (
    <div className="p-7 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-sm font-medium" style={{ color:"var(--ink)" }}>Planner</h1>
          <p className="text-xs mt-0.5" style={{ color:"var(--ink3)" }}>
            {upcomingCount > 0
              ? `${upcomingCount} compromisso${upcomingCount>1?"s":""} nos próximos 7 dias`
              : "Nenhum compromisso nos próximos 7 dias"}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View switcher */}
          <div className="flex rounded-lg overflow-hidden" style={{ border:"0.5px solid var(--border-strong)" }}>
            {(["mes","semana","lista"] as View[]).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{
                  fontSize:12, padding:"6px 14px", border:"none", cursor:"pointer",
                  background: view===v ? "var(--accent)" : "var(--surface)",
                  color: view===v ? "#fff" : "var(--ink2)",
                  fontFamily:"'DM Sans',sans-serif",
                  borderRight: v!=="lista" ? "0.5px solid var(--border-strong)" : "none",
                }}>
                {v === "mes" ? "Mês" : v === "semana" ? "Semana" : "Lista"}
              </button>
            ))}
          </div>
          <button onClick={()=>setModal({ open:true, editing:null })}
            style={{
              fontSize:13, padding:"7px 16px", borderRadius:8, border:"none",
              background:"var(--accent)", color:"#fff", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontWeight:500,
              display:"flex", alignItems:"center", gap:6,
            }}>
            <span style={{ fontSize:16, lineHeight:1 }}>+</span> Novo compromisso
          </button>
        </div>
      </div>

      {/* Period navigation */}
      {view !== "lista" && (
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevPeriod} style={{ background:"none", border:"0.5px solid var(--border-strong)", borderRadius:8, padding:"5px 10px", cursor:"pointer", color:"var(--ink2)", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>←</button>
          <h2 className="text-sm font-medium" style={{ color:"var(--ink)" }}>{periodLabel()}</h2>
          <button onClick={nextPeriod} style={{ background:"none", border:"0.5px solid var(--border-strong)", borderRadius:8, padding:"5px 10px", cursor:"pointer", color:"var(--ink2)", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>→</button>
        </div>
      )}

      {/* Calendar content */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"0.5px solid var(--border)" }}>
        {view === "mes" && (
          <div style={{ background:"var(--bg)" }}>
            <MonthView
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              compromissos={compromissos}
              onOpenEvent={(c)=>setModal({ open:true, editing:c })}
              onDayClick={(dateStr)=>setModal({ open:true, editing:null, defaultData:dateStr })}
            />
          </div>
        )}
        {view === "semana" && (
          <WeekView
            weekStart={weekStart}
            compromissos={compromissos}
            onOpenEvent={(c)=>setModal({ open:true, editing:c })}
            onDayClick={(dateStr)=>setModal({ open:true, editing:null, defaultData:dateStr })}
          />
        )}
        {view === "lista" && (
          <div style={{ padding:20, background:"var(--bg)" }}>
            <ListView compromissos={compromissos} onOpenEvent={(c)=>setModal({ open:true, editing:c })} />
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mt-4">
        {TIPOS.map(t=>(
          <div key={t} className="flex items-center gap-1.5">
            <div style={{ width:8, height:8, borderRadius:"50%", background:TIPO_COLOR[t] }} />
            <span style={{ fontSize:11, color:"var(--ink3)" }}>{TIPO_LABEL[t]}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <Modal
          editing={modal.editing}
          projetos={projetos}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={()=>setModal({ open:false, editing:null })}
        />
      )}
    </div>
  );
}
