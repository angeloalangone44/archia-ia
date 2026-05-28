import Link from "next/link";

/* ─── helpers ──────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
      {children}
    </p>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif-display text-4xl md:text-5xl leading-tight tracking-tight mb-4"
      style={{ color: "var(--ink)" }}
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
        <a href="#modulos" className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Módulos</a>
        <a href="#como-funciona" className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Como funciona</a>
        <a href="#precos" className="text-[13px] transition-colors hover:text-[var(--ink)]" style={{ color: "var(--ink2)" }}>Preços</a>
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(45,90,61,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(139,105,20,0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium mb-6"
        style={{ background: "var(--accent-light)", border: "0.5px solid rgba(45,90,61,0.25)", color: "var(--accent)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
        Assistente de IA para arquitetos
      </div>

      <h1
        className="font-serif-display leading-none tracking-tighter mb-6 max-w-3xl"
        style={{ fontSize: "clamp(42px,6vw,72px)", color: "var(--ink)" }}
      >
        Mais projeto,<br />
        <em style={{ fontStyle: "italic", color: "var(--accent)" }}>menos burocracia.</em>
      </h1>

      <p className="text-lg max-w-lg leading-relaxed mb-10 font-light" style={{ color: "var(--ink2)" }}>
        Briefing técnico, caderno de especificações e proposta comercial gerados por IA em minutos —
        padronizados, prontos para revisão e uso imediato.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
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

      <p className="flex items-center gap-1.5 text-xs mt-6" style={{ color: "var(--ink3)" }}>
        <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF7D" }} />
        Piloto gratuito · Sem necessidade de cadastro
      </p>
    </section>
  );
}

/* ─── STATS ─────────────────────────────────────────────── */

const STATS = [
  { num: "3–4h",    label: "economizadas por projeto em documentação" },
  { num: "3",       label: "documentos gerados por IA com 1 formulário" },
  { num: "< 5min",  label: "para gerar uma proposta completa" },
  { num: "LGPD",    label: "dados dos clientes não são armazenados" },
];

function Stats() {
  return (
    <div
      className="flex flex-wrap"
      style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}
    >
      {STATS.map((s, i) => (
        <div
          key={i}
          className="flex-1 min-w-[50%] md:min-w-0 text-center px-8 py-7"
          style={{ borderRight: i < STATS.length - 1 ? "0.5px solid var(--border)" : undefined }}
        >
          <span className="font-serif-display text-4xl tracking-tight block" style={{ color: "var(--ink)" }}>
            {s.num}
          </span>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink3)" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── MÓDULOS ────────────────────────────────────────────── */

const MODULES = [
  {
    num: "01", icon: "📋", iconBg: "var(--accent-light)",
    title: "Briefing técnico",
    desc: "Cliente preenche um formulário intuitivo. A IA transforma as respostas em um briefing padronizado e completo, pronto para o escritório trabalhar.",
    tag: "A cada cliente novo", tagBg: "var(--accent-light)", tagColor: "var(--accent)",
  },
  {
    num: "02", icon: "📖", iconBg: "var(--gold-light)",
    title: "Caderno de especificações",
    desc: "Arquiteto informa ambientes, padrão e restrições. A IA gera um rascunho técnico com materiais, acabamentos e normas ABNT aplicáveis.",
    tag: "Por projeto · revisão obrigatória", tagBg: "var(--gold-light)", tagColor: "var(--gold)",
  },
  {
    num: "03", icon: "📄", iconBg: "#E8EFF6",
    title: "Proposta comercial",
    desc: "Arquiteto informa escopo, etapas e honorários. A IA gera uma proposta profissional formatada, pronta para enviar ao cliente.",
    tag: "A cada novo contato", tagBg: "#E8EFF6", tagColor: "#1A3A5C",
  },
];

function Modules() {
  return (
    <section id="modulos" className="py-20 px-6 max-w-5xl mx-auto">
      <Tag>Módulos</Tag>
      <SectionH2>Tudo que o escritório<br />precisa documentar</SectionH2>
      <p className="text-base font-light max-w-md mb-14" style={{ color: "var(--ink2)" }}>
        Cada módulo resolve uma etapa específica do fluxo de projeto — sem duplicidade, sem ferramenta nova pra aprender.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <div
            key={m.num}
            className="relative rounded-2xl p-7 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}
          >
            <span className="absolute top-4 right-5 font-serif-display text-5xl leading-none" style={{ color: "var(--border)" }}>
              {m.num}
            </span>
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-xl mb-5" style={{ background: m.iconBg }}>
              {m.icon}
            </div>
            <h3 className="text-base font-medium mb-2" style={{ color: "var(--ink)" }}>{m.title}</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>{m.desc}</p>
            <span className="inline-block mt-4 text-[11px] px-2.5 py-0.5 rounded-full" style={{ background: m.tagBg, color: m.tagColor }}>
              {m.tag}
            </span>
          </div>
        ))}

        {/* card largo — painel */}
        <div
          className="md:col-span-3 rounded-2xl p-7 flex items-center gap-7"
          style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}
        >
          <div
            className="rounded-[10px] flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "#F0EDE6", width: 52, height: 52 }}
          >
            🗂️
          </div>
          <div>
            <h3 className="text-base font-medium mb-1" style={{ color: "var(--ink)" }}>Painel de projetos e clientes</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>
              Acompanhe o status de cada projeto — briefing, especificações, proposta enviada, aprovado. Visibilidade completa do pipeline do escritório.
            </p>
            <span
              className="inline-block mt-3 text-[11px] px-2.5 py-0.5 rounded-full"
              style={{ background: "var(--surface2)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}
            >
              Disponível nos planos Profissional e Escritório
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── COMO FUNCIONA ─────────────────────────────────────── */

const STEPS = [
  { n: 1, title: "Preencha o formulário",         desc: "Insira as informações do cliente e do projeto nos campos organizados. Leva menos tempo que um e-mail." },
  { n: 2, title: "A IA gera o documento",          desc: "O sistema transforma os dados em um documento estruturado, com terminologia técnica correta e formatação profissional." },
  { n: 3, title: "Revise e use",                   desc: "O documento gerado é um rascunho de alto nível. Você revisa, ajusta o que precisar e usa — ou exporta em PDF/Word." },
  { n: 4, title: "Projeto registrado no painel",   desc: "Cada projeto fica no painel com histórico de documentos gerados e status de andamento." },
];

function HowItWorks() {
  return (
    <div style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
      <section id="como-funciona" className="py-20 px-6 max-w-5xl mx-auto">
        <Tag>Como funciona</Tag>
        <SectionH2>Do formulário ao documento<br />em menos de 5 minutos</SectionH2>

        <div className="grid md:grid-cols-2 gap-14 mt-14 items-center">
          <div className="flex flex-col gap-7">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium text-white flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="text-[15px] font-medium mb-1" style={{ color: "var(--ink)" }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink2)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* mockup dark */}
          <div className="rounded-2xl p-7" style={{ background: "var(--ink)" }}>
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Entrada — formulário
            </p>
            <div className="font-mono text-xs leading-7" style={{ color: "rgba(255,255,255,0.45)" }}>
              {[
                ["Cliente: ", "Ana Camargo"],
                ["Tipo: ", "Residencial — casa"],
                ["Área: ", "280 m²"],
                ["Ambientes: ", "4 quartos, sala duplex..."],
                ["Orçamento: ", "R$ 1.200.000"],
              ].map(([k, v]) => (
                <div key={k}><span>{k}</span><span style={{ color: "#6BBF80" }}>{v}</span></div>
              ))}
            </div>
            <div className="my-4" style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }} />
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
      </section>
    </div>
  );
}

/* ─── PREÇOS ─────────────────────────────────────────────── */

const PLANS = [
  {
    badge: "Starter", price: "R$197", name: "Para começar",
    desc: "Arquiteto autônomo ou escritório solo com até 5 projetos ativos.",
    features: ["Briefing técnico (ilimitado)", "Proposta comercial (ilimitado)", "Painel básico de projetos", "Exportação em texto"],
    featured: false,
  },
  {
    badge: "⭐ Mais escolhido", price: "R$347", name: "Profissional",
    desc: "Escritório de 2–4 pessoas com fluxo contínuo de novos projetos.",
    features: ["Tudo do Starter", "Caderno de especificações", "CRM completo com histórico", "Exportação PDF e Word", "Templates personalizados"],
    featured: true,
  },
  {
    badge: "Escritório", price: "R$597", name: "Para equipes",
    desc: "Escritório estruturado que quer padronizar a produção de toda a equipe.",
    features: ["Tudo do Profissional", "Até 5 usuários", "Identidade visual do escritório", "Suporte prioritário", "Onboarding personalizado"],
    featured: false,
  },
];

function Pricing() {
  return (
    <div style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
      <section id="precos" className="py-20 px-6 max-w-5xl mx-auto">
        <Tag>Preços</Tag>
        <SectionH2>Simples. Sem surpresas.</SectionH2>
        <p className="text-base font-light max-w-md mb-14" style={{ color: "var(--ink2)" }}>
          Escolha o plano que faz sentido para o tamanho do seu escritório.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl p-7 flex flex-col"
              style={
                p.featured
                  ? { background: "var(--ink)", border: "0.5px solid var(--ink)" }
                  : { background: "var(--bg)", border: "0.5px solid var(--border-strong)" }
              }
            >
              <span
                className="inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full mb-4 self-start"
                style={
                  p.featured
                    ? { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }
                    : { background: "var(--accent-light)", color: "var(--accent)" }
                }
              >
                {p.badge}
              </span>

              <div className="font-serif-display text-[38px] tracking-tight leading-none mb-1" style={{ color: p.featured ? "#fff" : "var(--ink)" }}>
                {p.price}
              </div>
              <div className="text-[13px] mb-5" style={{ color: p.featured ? "rgba(255,255,255,0.45)" : "var(--ink3)" }}>por mês</div>

              <h3 className="text-base font-medium mb-1.5" style={{ color: p.featured ? "#fff" : "var(--ink)" }}>{p.name}</h3>
              <p className="text-xs mb-5 leading-relaxed flex-1" style={{ color: p.featured ? "rgba(255,255,255,0.55)" : "var(--ink2)" }}>
                {p.desc}
              </p>

              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: p.featured ? "rgba(255,255,255,0.75)" : "var(--ink2)" }}>
                    <span style={{ color: p.featured ? "#6BBF80" : "var(--accent)", flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/app"
                className="block text-center py-2.5 rounded-[9px] text-sm font-medium transition-opacity hover:opacity-85"
                style={
                  p.featured
                    ? { background: "#fff", color: "var(--ink)" }
                    : { background: "var(--surface)", color: "var(--ink)", border: "0.5px solid var(--border-strong)" }
                }
              >
                Começar agora
              </Link>
            </div>
          ))}
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
      <Tag>Privacidade e LGPD</Tag>
      <SectionH2>Seus dados e os dos seus<br />clientes estão protegidos</SectionH2>
      <div className="grid md:grid-cols-2 gap-10 mt-10">
        {LGPD_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-4 items-start">
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
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h2
          className="font-serif-display leading-tight tracking-tight max-w-2xl mb-4"
          style={{ fontSize: "clamp(30px,4vw,52px)", color: "#fff" }}
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
        <span>Piloto — versão 0.1 · Para validação de mercado</span>
        <span>Feito com Claude (Anthropic)</span>
      </footer>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
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
