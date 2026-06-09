import Link from "next/link";
import LandingAnimations from "@/components/LandingAnimations";

/* ─── helpers ──────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
      {children}
    </p>
  );
}

function SectionH2({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2
      className="font-serif-display leading-tight mb-4"
      style={{
        fontSize: "clamp(30px, 4vw, 48px)",
        letterSpacing: "-1px",
        color: "var(--ink)",
        textAlign: center ? "center" : undefined,
      }}
    >
      {children}
    </h2>
  );
}

/* ─── NAV ───────────────────────────────────────────────── */

function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-14"
      style={{
        background: "rgba(247,245,240,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <span className="font-serif-display text-xl tracking-tight" style={{ color: "var(--ink)" }}>
        archi<span style={{ color: "var(--accent)" }}>.</span>ia
      </span>
      <div className="hidden md:flex items-center gap-7">
        <a href="#modulos"        className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Módulos</a>
        <a href="#como-funciona"  className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Como funciona</a>
        <a href="#piloto"         className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Piloto</a>
        <Link
          href="/app"
          className="text-[13px] font-medium text-white rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Acessar o app
        </Link>
      </div>
    </nav>
  );
}

/* ─── HERO ──────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 relative overflow-hidden">
      {/* Gradiente de fundo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,90,61,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(45,90,61,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div
        className="hero-anim hero-anim-d1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium mb-6"
        style={{
          background: "rgba(45, 90, 61, 0.08)",
          backdropFilter: "blur(8px)",
          border: "0.5px solid rgba(45,90,61,0.2)",
          color: "var(--accent)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
        Assistente de IA para arquitetos
      </div>

      {/* H1 */}
      <h1
        className="hero-anim hero-anim-d2 font-serif-display leading-none tracking-tighter mb-6 max-w-3xl"
        style={{ fontSize: "clamp(48px, 6vw, 80px)", color: "var(--ink)", letterSpacing: "-2px", lineHeight: 1.05 }}
      >
        Mais projeto,<br />
        <em style={{ fontStyle: "italic", color: "var(--accent)" }}>menos burocracia.</em>
      </h1>

      {/* Subtítulo */}
      <p className="hero-anim hero-anim-d3 text-lg max-w-lg leading-relaxed mb-3 font-light" style={{ color: "var(--ink2)" }}>
        Qualifique clientes antes da reunião, gere briefings por ambiente e produza propostas com a sua identidade — em minutos.
      </p>
      <p className="hero-anim hero-anim-d4 text-sm max-w-md mb-9" style={{ color: "var(--ink3)" }}>
        Feito para arquitetos autônomos e pequenos escritórios que atendem muitos clientes novos.
      </p>

      {/* Botões */}
      <div className="hero-anim hero-anim-d5 flex gap-3 flex-wrap justify-center">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-white rounded-[10px] px-7 py-3.5 text-[15px] font-medium transition-all hover:opacity-90 hover:-translate-y-px"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Acessar o piloto
        </Link>
        <a
          href="#modulos"
          className="inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3.5 text-sm transition-colors hover:bg-white"
          style={{ color: "var(--ink2)", border: "0.5px solid var(--border-strong)" }}
        >
          Ver módulos →
        </a>
      </div>

      <p className="hero-anim hero-anim-d6 flex items-center gap-1.5 text-xs mt-6" style={{ color: "var(--ink3)" }}>
        <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF7D" }} />
        Piloto gratuito · Sem necessidade de cadastro
      </p>
    </section>
  );
}

/* ─── STATS ─────────────────────────────────────────────── */

const STATS = [
  { num: "< 5min",  label: "Documentação gerada por projeto" },
  { num: "4",       label: "módulos disponíveis" },
  { num: "< 5min",  label: "para gerar uma proposta completa" },
  { num: "LGPD",    label: "dados dos clientes não são armazenados" },
];

function Stats() {
  return (
    <div
      className="flex flex-wrap"
      style={{
        background: "var(--surface)",
        borderTop: "0.5px solid var(--border)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      {STATS.map((s, i) => (
        <div
          key={i}
          data-animate
          data-delay={String(i * 80)}
          className="flex-1 min-w-[50%] md:min-w-0 text-center px-8 py-7"
          style={{ borderRight: i < STATS.length - 1 ? "0.5px solid var(--border)" : undefined }}
        >
          <span
            className="font-serif-display block"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--accent)", lineHeight: 1.1 }}
          >
            {s.num}
          </span>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink3)" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── ÍCONES SVG por módulo ─────────────────────────────── */

const ICONS = {
  qualificacao: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M16 11l2 2 4-4" />
    </svg>
  ),
  briefing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  proposta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  specs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  ),
  painel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
};

/* ─── MÓDULOS ────────────────────────────────────────────── */

function Modules() {
  return (
    <section id="modulos" className="py-20 px-6 max-w-5xl mx-auto">
      <div data-animate>
        <Tag>Módulos</Tag>
        <SectionH2>Tudo que o escritório<br />precisa documentar</SectionH2>
        <p className="text-base font-light max-w-md mb-14" style={{ color: "var(--ink2)" }}>
          Cada módulo resolve uma etapa específica do fluxo de projeto — sem duplicidade, sem ferramenta nova pra aprender.
        </p>
      </div>

      <div className="flex flex-col gap-4">

        {/* 01 — Qualificação */}
        <div
          data-animate-sm
          data-delay="0"
          className="rounded-2xl p-7 flex items-start gap-7 transition-all duration-200"
          style={{ background: "var(--ink)", border: "0.5px solid var(--ink)" }}
        >
          <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)", width: 52, height: 52, color: "#6BBF80" }}>
            {ICONS.qualificacao}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium" style={{ color: "#fff" }}>Qualificação de cliente</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(107,191,128,0.2)", color: "#6BBF80" }}>Novo</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              O cliente responde um formulário curto antes da primeira reunião. A IA gera para o arquiteto: perfil do cliente, pontos de atenção, perguntas sugeridas para a reunião e indicação de aderência ao padrão do escritório.
            </p>
            <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Antes de cada reunião inicial
            </span>
          </div>
        </div>

        {/* grade 3 colunas */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              num: "02", icon: ICONS.briefing, iconBg: "var(--accent-light)", iconColor: "var(--accent)",
              title: "Briefing técnico",
              desc: "Formulário por ambiente com checkboxes e campos específicos por cômodo. A IA gera briefing em formato de checklist, com pontos de atenção e inconsistências detectadas.",
              tag: "A cada cliente novo", tagBg: "var(--accent-light)", tagColor: "var(--accent)",
              delay: "60",
            },
            {
              num: "03", icon: ICONS.proposta, iconBg: "#E8EFF6", iconColor: "#1A3A5C",
              title: "Proposta comercial",
              desc: "Arquiteto informa escopo, honorários e a identidade do escritório. A IA gera uma proposta no tom e vocabulário do arquiteto — não genérica.",
              tag: "A cada novo contato", tagBg: "#E8EFF6", tagColor: "#1A3A5C",
              delay: "120",
            },
            {
              num: "04", icon: ICONS.specs, iconBg: "var(--gold-light)", iconColor: "var(--gold)",
              title: "Especificações técnicas",
              desc: "Para projetos que exigem documentação técnica detalhada — sempre com revisão do arquiteto responsável.",
              tag: "Rascunho · revisão obrigatória", tagBg: "var(--gold-light)", tagColor: "var(--gold)",
              muted: true, delay: "180",
            },
          ].map((m) => (
            <div
              key={m.num}
              data-animate-sm
              data-delay={m.delay}
              className="module-card relative rounded-2xl p-7 overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "0.5px solid rgba(0,0,0,0.08)",
                opacity: m.muted ? 0.8 : 1,
              }}
            >
              <span className="absolute top-4 right-5 font-serif-display leading-none select-none" style={{ fontSize: 56, color: "var(--border)", lineHeight: 1 }}>
                {m.num}
              </span>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: m.iconBg, color: m.iconColor }}>
                {m.icon}
              </div>
              <h3 className="text-base font-medium mb-2" style={{ color: "var(--ink)" }}>{m.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>{m.desc}</p>
              <span className="inline-block mt-4 text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: m.tagBg, color: m.tagColor }}>
                {m.tag}
              </span>
            </div>
          ))}
        </div>

        {/* 05 — Painel */}
        <div
          data-animate-sm
          data-delay="0"
          className="rounded-2xl p-7 flex items-center gap-7"
          style={{ background: "var(--surface)", border: "0.5px solid rgba(0,0,0,0.08)" }}
        >
          <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EDE8F5", color: "#6B3FA0", width: 52, height: 52 }}>
            {ICONS.painel}
          </div>
          <div>
            <h3 className="text-base font-medium mb-1" style={{ color: "var(--ink)" }}>Painel de projetos e clientes</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>
              Acompanhe o status de cada projeto — qualificação, briefing, proposta enviada, aprovado. Visibilidade do pipeline do escritório.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── COMO FUNCIONA ─────────────────────────────────────── */

const STEPS = [
  { n: 1, title: "Preencha o formulário",       desc: "Insira as informações do cliente e do projeto nos campos organizados. Leva menos tempo que um e-mail." },
  { n: 2, title: "A IA gera o documento",        desc: "O sistema transforma os dados em um documento estruturado, com terminologia técnica correta e formatação profissional." },
  { n: 3, title: "Revise e use",                 desc: "O documento gerado é um rascunho de alto nível. Você revisa, ajusta o que precisar e usa — ou exporta em PDF." },
  { n: 4, title: "Projeto registrado no painel", desc: "Cada projeto fica no painel com histórico de documentos gerados e status de andamento." },
];

function HowItWorks() {
  return (
    <div style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
      <section id="como-funciona" className="py-20 px-6 max-w-5xl mx-auto">
        <div data-animate>
          <Tag>Como funciona</Tag>
          <SectionH2>Do formulário ao documento<br />em menos de 5 minutos</SectionH2>
        </div>

        <div className="grid md:grid-cols-2 gap-14 mt-14 items-center">
          {/* Passos */}
          <div className="flex flex-col gap-7">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-animate
                data-delay={String(i * 80)}
                className="flex gap-4 relative"
              >
                {/* Número decorativo de fundo */}
                <span
                  className="font-serif-display select-none pointer-events-none absolute"
                  style={{ fontSize: 80, lineHeight: 1, opacity: 0.06, color: "var(--accent)", top: -10, left: -10, zIndex: 0 }}
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium text-white flex-shrink-0 relative z-10"
                  style={{ background: "var(--accent)" }}
                >
                  {s.n}
                </div>
                <div className="relative z-10">
                  <h3 className="text-[15px] font-medium mb-1" style={{ color: "var(--ink)" }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mockup dark */}
          <div
            data-mockup
            className="rounded-2xl p-7"
            style={{ background: "var(--ink)" }}
          >
            <div className="mockup-p1">
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Entrada — formulário
              </p>
              <div className="font-mono text-xs leading-7" style={{ color: "rgba(255,255,255,0.45)" }}>
                {[
                  ["Cliente: ",    "Ana Camargo"],
                  ["Tipo: ",       "Residencial — casa"],
                  ["Área: ",       "280 m²"],
                  ["Ambientes: ",  "4 quartos, sala duplex..."],
                  ["Orçamento: ",  "R$ 1.200.000"],
                ].map(([k, v]) => (
                  <div key={k}><span>{k}</span><span style={{ color: "#6BBF80" }}>{v}</span></div>
                ))}
              </div>
            </div>

            <div className="mockup-p2 my-4" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }} />

            <div className="mockup-p3">
              <p className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Briefing gerado — trecho
              </p>
              <div className="text-xs leading-7" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
                1. IDENTIFICAÇÃO DO PROJETO<br />
                Cliente: Ana Camargo<br />
                Tipologia: Residência unifamiliar<br />
                Área: 280 m² (construída)<br /><br />
                2. PROGRAMA DE NECESSIDADES<br />
                • 4 dormitórios, sendo 1 suíte master<br />
                <span style={{ paddingLeft: "1em" }}>com closet e banheiro privativo...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── PILOTO ─────────────────────────────────────────────── */

function Pricing() {
  return (
    <div style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
      <section id="piloto" className="py-20 px-6 max-w-5xl mx-auto">
        <div data-animate>
          <Tag>Acesso antecipado</Tag>
          <SectionH2>Piloto gratuito.<br />Sem cartão de crédito.</SectionH2>
          <p className="text-base font-light max-w-xl mb-10" style={{ color: "var(--ink2)" }}>
            Sem cadastro. Estamos selecionando os primeiros escritórios para testar o archi.ia e moldar o produto junto com quem usa no dia a dia.
          </p>
        </div>
        <div data-animate data-delay="80" className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-white rounded-[10px] px-7 py-3.5 text-[15px] font-medium transition-all hover:opacity-90 hover:-translate-y-px"
            style={{ background: "var(--accent)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quero participar do piloto
          </Link>
          <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink3)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF7D" }} />
            Acesso imediato · Sem cadastro
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─── LGPD ───────────────────────────────────────────────── */

const LGPD_ITEMS = [
  { icon: "🔒", title: "Dados não são armazenados",  desc: "As informações inseridas nos formulários são usadas apenas para gerar o documento naquela sessão. Nada é salvo nos nossos servidores." },
  { icon: "🛡️", title: "API sem retenção de dados",   desc: "Usamos a API da Anthropic com zero retention — os dados enviados para geração não são usados para treinar modelos." },
  { icon: "📋", title: "Você controla os dados",      desc: "O histórico de projetos fica no seu navegador (localStorage). Você pode excluir qualquer dado a qualquer momento." },
  { icon: "⚠️", title: "Responsabilidade técnica",    desc: "Documentos gerados por IA são rascunhos de referência. A responsabilidade técnica pelos projetos é sempre do arquiteto responsável." },
];

function LgpdSection() {
  return (
    <section id="lgpd" className="py-20 px-6 max-w-5xl mx-auto">
      <div data-animate>
        <Tag>Privacidade e LGPD</Tag>
        <SectionH2>Seus dados e os dos seus<br />clientes estão protegidos</SectionH2>
      </div>
      <div className="grid md:grid-cols-2 gap-10 mt-10">
        {LGPD_ITEMS.map((item, i) => (
          <div
            key={item.title}
            data-animate
            data-delay={String(i * 80)}
            className="flex gap-4 items-start"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: "var(--accent-light)" }}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>{item.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA FINAL + FOOTER ─────────────────────────────────── */

function CtaFinal() {
  return (
    <div style={{ background: "var(--ink)" }}>
      <div
        data-animate
        className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center"
      >
        <h2
          className="font-serif-display leading-tight tracking-tight max-w-2xl mb-4"
          style={{ fontSize: "clamp(30px,4vw,52px)", color: "#fff", letterSpacing: "-1px" }}
        >
          Pronto para gerar seu primeiro<br />
          <em style={{ fontStyle: "italic", color: "#6BBF80" }}>briefing em 5 minutos?</em>
        </h2>
        <p className="text-base mb-9" style={{ color: "rgba(255,255,255,0.55)" }}>
          Piloto gratuito. Sem cartão de crédito. Sem cadastro.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 bg-white rounded-[10px] px-8 py-3.5 text-[15px] font-medium transition-all hover:opacity-90 hover:-translate-y-px"
          style={{ color: "var(--ink)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Acessar o piloto agora
        </Link>
      </div>

      <footer
        className="flex flex-col md:flex-row items-center justify-between px-10 py-6 gap-3 text-xs"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
      >
        <span className="font-serif-display text-[15px]" style={{ color: "rgba(255,255,255,0.6)" }}>archi.ia</span>
        <span>Piloto · Para validação de mercado</span>
        <span>Feito com Claude (Anthropic)</span>
      </footer>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <LandingAnimations />
      <Nav />
      <Hero />
      <Stats />
      <Modules />
      <HowItWorks />
      <Pricing />
      <LgpdSection />
      <CtaFinal />
    </>
  );
}
