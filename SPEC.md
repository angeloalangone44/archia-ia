# SPEC — archi.ia v0.1 (piloto)

## Objetivo
Produto web funcional para validação com arquitetos.
Foco: os 3 geradores de documento + painel básico de projetos.

## Fora de escopo nesta versão
- Autenticação de usuários
- Banco de dados (projetos ficam em localStorage do browser)
- Pagamento / planos
- Export PDF/Word

## Páginas e rotas
/                → landing page (one-pager)
/app             → dashboard com painel de projetos
/app/briefing    → gerador de briefing técnico
/app/specs       → gerador de caderno de especificações
/app/proposta    → gerador de proposta comercial

## Componentes principais
- DocumentForm    → formulário de entrada de cada módulo
- StreamingOutput → exibe output da API em streaming
- ProjectPanel    → lista de projetos com status (localStorage)
- SystemPrompt    → contexto fixo de arquitetura enviado à API

## API routes (server-side)
POST /api/generate
  body: { tipo: 'briefing' | 'specs' | 'proposta', dados: {...} }
  → chama Claude API com streaming
  → ANTHROPIC_API_KEY nunca vai ao cliente

## System prompt base (em /lib/prompts.ts)
Especialista em arquitetura brasileira, normas ABNT, terminologia técnica.
Ver conteúdo completo em `referencias/archia-piloto.html`
(variáveis SYSTEM_BASE e PROMPTS no bloco de script).

## Verificação de conclusão
1. `npm run build` sem erros
2. POST /api/generate retorna stream com texto de briefing
3. Formulário de proposta gera documento completo
4. Nenhuma variável ANTHROPIC_API_KEY aparece no bundle do cliente
5. Deploy no Vercel responde em < 3s no primeiro load
