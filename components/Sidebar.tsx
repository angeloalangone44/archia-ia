"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    section: "",
    items: [
      {
        href: "/app",
        label: "Início",
        icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      },
    ],
  },
  {
    section: "Documentos",
    items: [
      {
        href: "/app/qualificacao",
        label: "Qualificação de cliente",
        icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      },
      {
        href: "/app/briefing",
        label: "Briefing técnico",
        icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
      },
      {
        href: "/app/proposta",
        label: "Proposta comercial",
        icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      },
      {
        href: "/app/calculadora",
        label: "Calculadora",
        icon: <><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={1.8} fill="none"/><path d="M8 8h2m2 0h4M8 12h2m2 0h4M8 16h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></>,
      },
      {
        href: "/app/specs",
        label: "Especificações técnicas",
        icon: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      },
    ],
  },
  {
    section: "Gestão",
    items: [
      {
        href: "/app/projetos",
        label: "Projetos",
        icon: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
      },
      {
        href: "/app/planner",
        label: "Planner",
        icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      },
      {
        href: "/app/configuracoes",
        label: "Configurações",
        icon: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 220, background: "#1A1814", flexShrink: 0 }}
      className="flex flex-col h-screen"
    >
      {/* Logo */}
      <Link href="/app" style={{ textDecoration: "none" }}>
        <div className="px-5 py-6 transition-opacity hover:opacity-80" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div className="text-white text-xl tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            archi.ia
          </div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Assistente para arquitetos
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section || "__home__"}>
            {group.section && (
              <div className="px-5 pt-4 pb-1.5 text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                {group.section}
              </div>
            )}
            {!group.section && <div className="pt-2" />}
            <ul className="px-2.5 space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] transition-colors"
                      style={{
                        color: active ? "#fff" : "rgba(255,255,255,0.55)",
                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="w-4 h-4 flex-shrink-0"
                        style={{ opacity: active ? 1 : 0.7 }}
                      >
                        {item.icon}
                      </svg>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* LGPD */}
      <div className="p-5" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-2 items-start rounded-lg p-2.5" style={{ background: "rgba(45,90,61,0.25)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#6BBF80" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Dados dos clientes não são armazenados (LGPD). Usados apenas nesta sessão.
          </p>
        </div>
      </div>
    </aside>
  );
}
