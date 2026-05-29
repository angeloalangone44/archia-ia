# archi.ia — Contexto do projeto

## O que é
Assistente de IA para escritórios de arquitetura brasileiros.
Gera documentos de qualificação, briefing técnico por ambiente, proposta comercial personalizada e especificações técnicas via Claude API.

## Público-alvo
**Arquitetos autônomos e pequenos escritórios (1–3 pessoas) com alto volume de clientes novos.**
Não é para escritórios médios/grandes. O foco é agilidade na entrada de novos clientes.

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

## Módulos em ordem de prioridade
1. **Qualificação de cliente** (`/app/qualificacao`) — formulário pré-reunião → relatório para o arquiteto
2. **Briefing técnico** (`/app/briefing`) — wizard 3 passos com seleção e detalhe por ambiente
3. **Proposta comercial** (`/app/proposta`) — com seção "Identidade do escritório" para personalizar tom
4. **Especificações técnicas** (`/app/specs`) — rascunho técnico, menos destaque na UI
5. **Painel de projetos** (`/app`) — localStorage, sem banco de dados ainda

## Estrutura de arquivos
```
app/
  page.tsx                    # Landing page (server component)
  layout.tsx                  # Root layout — DM Serif Display + DM Sans
  globals.css                 # Variáveis CSS + Tailwind
  api/generate/route.ts       # POST /api/generate — streaming, max_tokens por tipo
  app/
    layout.tsx                # Layout /app/* — sidebar
    page.tsx                  # /app — painel de projetos (localStorage)
    qualificacao/page.tsx     # Gerador de qualificação (8 campos)
    briefing/page.tsx         # Briefing multi-step (3 passos + por ambiente)
    specs/page.tsx            # Especificações técnicas
    proposta/page.tsx         # Proposta com identidade do escritório
components/
  Sidebar.tsx                 # Sidebar escura, 4 módulos + painel
  DocumentForm.tsx            # Wrapper + Input/Select/Textarea/FormGroup
  StreamingOutput.tsx         # Display streaming com cursor + copiar
  ProjectPanel.tsx            # Painel de projetos do localStorage
lib/
  prompts.ts                  # Types + PROMPTS para os 4 tipos de documento
  useGenerate.ts              # Hook: fetch /api/generate, lê stream, auto-salva
  projects.ts                 # CRUD localStorage: saveProject/getProjects/deleteProject
referencias/
  archia-piloto.html          # Design de referência do app
  archia-onepager.html        # Design de referência da landing
```

## Estado atual (v0.2)
- ✅ Landing page atualizada com qualificação em destaque
- ✅ Qualificação de cliente (`/app/qualificacao`) — novo
- ✅ Briefing wizard 3 passos com seleção e detalhes por ambiente — reformulado
- ✅ Proposta com seção de identidade do escritório (tom, diferenciais, frase) — atualizado
- ✅ Especificações técnicas mantidas com menor destaque
- ✅ Painel de projetos em localStorage (auto-salva após geração)
- ✅ Sidebar com 4 módulos na ordem de prioridade
- ❌ Autenticação — não implementada
- ❌ Banco de dados — projetos em localStorage
- ❌ Export PDF/Word — não implementado
- ❌ Pagamento / planos — não implementado

## Regras inegociáveis
- LGPD: dados de clientes NUNCA persistidos no servidor. Sessão apenas.
- ANTHROPIC_API_KEY fica SOMENTE em variável de ambiente server-side.
  Nunca exposta no cliente. Chamadas à API sempre via route handler Next.js.
- Caderno de especificações sempre acompanha aviso de revisão obrigatória.
- **Nenhum formulário deve ter mais de 3 passos visíveis de uma vez.**
- Lógica condicional obrigatória no briefing (tipo → ambientes → detalhes).

## Comandos do projeto
- Instalar: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `git push origin master` → Vercel redeploya automaticamente

## Variáveis de ambiente
| Variável | Onde | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` (local) e Vercel (produção) | Chave da API Anthropic |
