# archi.ia — Contexto do projeto

## O que é
Assistente de IA para escritórios de arquitetura brasileiros.
Gera briefing técnico, caderno de especificações e proposta comercial via Claude API.

## URLs
- **Produção:** https://archia-ia.vercel.app
- **Repositório:** https://github.com/angeloalangone44/archia-ia
- **Vercel dashboard:** https://vercel.com/imovel-flow/archia-ia

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Claude API (**claude-sonnet-4-5**) com streaming
- Vercel para deploy (conectado ao GitHub — push em master redeploya)
- GitHub para versionamento

## Estrutura de arquivos
```
app/
  page.tsx                  # Landing page (server component)
  layout.tsx                # Root layout — DM Serif Display + DM Sans
  globals.css               # Variáveis CSS + Tailwind
  api/generate/route.ts     # POST /api/generate — streaming server-side
  app/
    layout.tsx              # Layout /app/* — sidebar
    page.tsx                # /app — painel de projetos (localStorage)
    briefing/page.tsx       # Gerador de briefing
    specs/page.tsx          # Gerador de caderno de especificações
    proposta/page.tsx       # Gerador de proposta comercial
components/
  Sidebar.tsx               # Sidebar escura com nav ativa
  DocumentForm.tsx          # Wrapper de form + Input/Select/Textarea/FormGroup
  StreamingOutput.tsx       # Display de streaming com cursor + botão copiar
  ProjectPanel.tsx          # Painel de projetos do localStorage
lib/
  prompts.ts                # SYSTEM_BASE + PROMPTS (briefing/specs/proposta)
  useGenerate.ts            # Hook: fetch /api/generate, lê stream, auto-salva
  projects.ts               # CRUD localStorage: saveProject/getProjects/deleteProject
referencias/
  archia-piloto.html        # Design de referência do app
  archia-onepager.html      # Design de referência da landing
```

## Estado atual (v0.1 — piloto)
- ✅ Landing page completa e deployada
- ✅ 3 geradores funcionais com streaming real (Claude API)
- ✅ Sidebar com navegação ativa
- ✅ Painel de projetos em localStorage (auto-salva após geração)
- ✅ LGPD: dados nunca persistidos no servidor
- ❌ Autenticação — não implementada (fora de escopo v0.1)
- ❌ Banco de dados — não implementado (projetos em localStorage)
- ❌ Export PDF/Word — não implementado
- ❌ Pagamento / planos — não implementado

## Regras inegociáveis
- LGPD: dados de clientes NUNCA persistidos no servidor. Sessão apenas.
- ANTHROPIC_API_KEY fica SOMENTE em variável de ambiente server-side.
  Nunca exposta no cliente. Chamadas à API sempre via route handler Next.js.
- Caderno de especificações sempre acompanha aviso de revisão obrigatória.

## Comandos do projeto
- Instalar: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `git push origin master` → Vercel redeploya automaticamente

## Variáveis de ambiente
| Variável | Onde | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` (local) e Vercel (produção) | Chave da API Anthropic |
