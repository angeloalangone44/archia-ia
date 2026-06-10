-- ============================================================
-- archi.ia — Schema Supabase (sem autenticação — piloto anônimo)
-- Execute no SQL Editor do Supabase Dashboard
-- Se já rodou a versão anterior, execute: DROP TABLE IF EXISTS
-- escritorio, projetos, documentos, compromissos,
-- links_projeto, modelos_escritorio CASCADE;
-- e então rode este script.
-- ============================================================

-- projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  localizacao TEXT,
  moradores TEXT,
  pet TEXT,
  tipo_projeto TEXT,
  area TEXT,
  orcamento TEXT,
  prazo TEXT,
  perfil_estetico JSONB DEFAULT '{}',
  ambientes JSONB DEFAULT '{}',
  status_etapa TEXT DEFAULT 'briefing',
  etapas_status JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projetos_session ON projetos(session_id);

-- documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('briefing','proposta','specs','qualificacao','calculo')),
  conteudo TEXT NOT NULL,
  dados_entrada JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(projeto_id, tipo)
);
CREATE INDEX IF NOT EXISTS idx_documentos_session ON documentos(session_id);

-- compromissos
CREATE TABLE IF NOT EXISTS compromissos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo TEXT,
  data DATE,
  horario TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compromissos_session ON compromissos(session_id);

-- links_projeto
CREATE TABLE IF NOT EXISTS links_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT DEFAULT 'outro' CHECK (tipo IN ('planta','renderizacao','referencia','contrato','orcamento','foto','outro')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_links_session ON links_projeto(session_id);

-- modelos_escritorio
CREATE TABLE IF NOT EXISTS modelos_escritorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('briefing','proposta')),
  nome TEXT NOT NULL DEFAULT 'Modelo principal',
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_modelos_session ON modelos_escritorio(session_id);
