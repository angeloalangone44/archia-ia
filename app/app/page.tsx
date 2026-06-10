"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getArchiaProjects, type ArchiaProjetoUnificado } from "@/lib/archia-project";
import { getCompromissos, todayStr, relativeDay, TIPO_LABEL, TIPO_COLOR, TIPO_BG, type Compromisso } from "@/lib/planner";

/* ── helpers ────────────────────────────────────────────── */

const DIAS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function today(): { dia: string; mes: string; ano: string; semana: string } {
  const d = new Date();
  return {
    dia: String(d.getDate()),
    mes: MESES_PT[d.getMonth()],
    ano: String(d.getFullYear()),
    semana: DIAS_PT[d.getDay()],
  };
}

// Etapas do projeto e progresso
function getEtapaLabel(p: ArchiaProjetoUnificado): string {
  if (p.documentos.especificacoes) return "Especificações";
  if (p.documentos.proposta) return "Proposta";
  if (p.documentos.briefing) return "Briefing";
  return "Novo";
}

function getProgressoPct(p: ArchiaProjetoUnificado): number {
  if (p.documentos.especificacoes) return 100;
  if (p.documentos.proposta) return 66;
  if (p.documentos.briefing) return 33;
  return 8;
}

function getProgressoColor(pct: number): string {
  if (pct >= 100) return "var(--accent)";
  if (pct >= 66) return "#2374AB";
  if (pct >= 33) return "#C06000";
  return "var(--border-strong)";
}

/* ── ações rápidas ──────────────────────────────────────── */

const ACOES = [
  {
    href: "/app/briefing",
    label: "Novo briefing",
    desc: "Iniciar um projeto com cliente",
    color: "#2D5A3D",
    bg: "#EAF2EC",
    icon: (
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    href: "/app/qualificacao",
    label: "Qualificar cliente",
    desc: "Analisar fit antes da reunião",
    color: "#2374AB",
    bg: "#EBF5FB",
    icon: (
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
  {
    href: "/app/calculadora",
    label: "Calcular honorário",
    desc: "Estimar valor dos serviços",
    color: "#7B3FAD",
    bg: "#F5EEF8",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={1.8} fill="none"/>
        <path d="M8 8h2m2 0h4M8 12h2m2 0h4M8 16h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
      </>
    ),
  },
  {
    href: "/app/projetos",
    label: "Ver projetos",
    desc: "Todos os clientes e documentos",
    color: "#C06000",
    bg: "#FEF3E8",
    icon: (
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    ),
  },
];

/* ── atalhos de módulos ─────────────────────────────────── */

const MODULOS = [
  { href: "/app/briefing", label: "Briefing", icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { href: "/app/proposta", label: "Proposta", icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { href: "/app/specs", label: "Especificações", icon: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { href: "/app/calculadora", label: "Calculadora", icon: <><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={1.8} fill="none"/><path d="M8 8h2m2 0h4M8 12h2m2 0h4M8 16h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></> },
  { href: "/app/qualificacao", label: "Qualificação", icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
  { href: "/app/planner", label: "Planner", icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
];

/* ── componente principal ───────────────────────────────── */

export default function HomePage() {
  const [projetos, setProjetos] = useState<ArchiaProjetoUnificado[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProjetos(getArchiaProjects().slice(0, 5));
    const hoje = todayStr();
    const proximos = getCompromissos()
      .filter((c) => c.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario))
      .slice(0, 3);
    setCompromissos(proximos);
  }, []);

  const dt = today();

  return (
    <div className="p-7 max-w-3xl">

      {/* ── Saudação ──────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs mb-1" style={{ color: "var(--ink3)" }}>
          {dt.semana}, {dt.dia} de {dt.mes} de {dt.ano}
        </p>
        <h1 className="text-2xl font-medium" style={{ color: "var(--ink)", fontFamily: "'DM Serif Display', serif" }}>
          Bem-vindo de volta
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink3)" }}>
          O que vamos gerar hoje?
        </p>
      </div>

      {/* ── Ações rápidas ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        {ACOES.map((a) => (
          <Link key={a.href} href={a.href}
            className="flex flex-col gap-3 rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-sm"
            style={{ background: a.bg, border: `0.5px solid ${a.color}22`, textDecoration: "none" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: a.color }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} className="w-4.5 h-4.5" style={{ width: 18, height: 18 }}>
                {a.icon}
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium leading-tight" style={{ color: a.color }}>{a.label}</p>
              <p className="text-[11px] mt-0.5 leading-tight" style={{ color: a.color, opacity: 0.7 }}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Resumo de projetos ────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Projetos recentes</h2>
          <Link href="/app/projetos" className="text-[12px] flex items-center gap-1"
            style={{ color: "var(--accent)", textDecoration: "none" }}>
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {!mounted || projetos.length === 0 ? (
          <div className="rounded-2xl p-6 text-center"
            style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--ink3)" }}>
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Nenhum projeto ainda</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>
              Gere seu primeiro briefing para começar
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border)" }}>
            {projetos.map((p, i) => {
              const pct = getProgressoPct(p);
              const color = getProgressoColor(pct);
              const etapa = getEtapaLabel(p);
              return (
                <Link key={p.id} href="/app/projetos"
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--surface2)]"
                  style={{
                    display: "flex",
                    background: "var(--surface)",
                    borderBottom: i < projetos.length - 1 ? "0.5px solid var(--border)" : "none",
                    textDecoration: "none",
                  }}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-medium text-white"
                    style={{ background: color }}>
                    {(p.cliente.nome || "?")[0].toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>
                      {p.cliente.nome || "Sem nome"}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--ink3)" }}>
                      {p.projeto.tipo || "Projeto"}{p.projeto.area ? ` · ${p.projeto.area}` : ""}
                    </p>
                  </div>
                  {/* Etapa + progresso */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${color}18`, color }}>
                      {etapa}
                    </span>
                    <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Próximos compromissos ─────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Próximos compromissos</h2>
          <Link href="/app/planner" className="text-[12px] flex items-center gap-1"
            style={{ color: "var(--accent)", textDecoration: "none" }}>
            Ver agenda
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {!mounted || compromissos.length === 0 ? (
          <div className="rounded-2xl p-5 flex items-center gap-3"
            style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 flex-shrink-0" style={{ color: "var(--ink3)" }}>
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Nenhum compromisso agendado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {compromissos.map((c) => (
              <Link key={c.id} href="/app/planner"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{ background: "var(--surface)", border: "0.5px solid var(--border)", textDecoration: "none" }}>
                {/* Tipo badge */}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TIPO_COLOR[c.tipo] }} />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>{c.titulo}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--ink3)" }}>
                    {TIPO_LABEL[c.tipo]}{c.clienteNome ? ` · ${c.clienteNome}` : ""}
                  </p>
                </div>
                {/* Data */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: TIPO_BG[c.tipo], color: TIPO_COLOR[c.tipo] }}>
                    {relativeDay(c.data)}
                  </span>
                  {c.horario && (
                    <span className="text-[10px] mt-0.5" style={{ color: "var(--ink3)" }}>{c.horario}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Atalhos de módulos ────────────────────── */}
      <div>
        <h2 className="text-[13px] font-medium mb-3" style={{ color: "var(--ink)" }}>Módulos</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MODULOS.map((m) => (
            <Link key={m.href} href={m.href}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all hover:scale-[1.03]"
              style={{ background: "var(--surface)", border: "0.5px solid var(--border)", textDecoration: "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--surface2)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 16, height: 16, color: "var(--ink2)" }}>
                  {m.icon}
                </svg>
              </div>
              <span className="text-[10px] text-center leading-tight" style={{ color: "var(--ink3)" }}>{m.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
