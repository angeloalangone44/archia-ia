# archi.ia — Contexto do projeto

## O que é
Assistente de IA para escritórios de arquitetura brasileiros.
Gera briefing técnico, caderno de especificações e proposta comercial via Claude API.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Claude API (claude-sonnet-4-20250514) com streaming
- Vercel para deploy
- GitHub para versionamento

## Arquivos de referência
- Design e fluxo do piloto: `referencias/archia-piloto.html`
- Layout e copy do one-pager: `referencias/archia-onepager.html`

## Regras inegociáveis
- LGPD: dados de clientes NUNCA persistidos no servidor. Sessão apenas.
- ANTHROPIC_API_KEY fica SOMENTE em variável de ambiente server-side.
  Nunca exposta no cliente. Chamadas à API sempre via route handler Next.js.
- Caderno de especificações sempre acompanha aviso de revisão obrigatória.

## Comandos do projeto
- Instalar: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: push para main → Vercel faz deploy automático

## Variáveis de ambiente necessárias
Ver `.env.example`
