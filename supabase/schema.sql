-- ============================================================
-- archi.ia — Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- escritorio
CREATE TABLE IF NOT EXISTS escritorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  valor_hora NUMERIC DEFAULT 150,
  horas_mensais NUMERIC DEFAULT 160,
  margem_lucro NUMERIC DEFAULT 30,
  custos_fixos NUMERIC DEFAULT 0,
  etapas_config JSONB DEFAULT '[]',
  tom_comunicacao TEXT,
  diferenciais TEXT,
  frase_apresentacao TEXT,
  modelo_briefing TEXT,
  modelo_proposta TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE escritorio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own escritorio" ON escritorio
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID REFERENCES escritorio(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projetos" ON projetos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('briefing','proposta','specs','qualificacao','calculo')),
  conteudo TEXT NOT NULL,
  dados_entrada JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(projeto_id, tipo)
);
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own documentos" ON documentos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- compromissos
CREATE TABLE IF NOT EXISTS compromissos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo TEXT,
  data DATE,
  horario TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE compromissos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own compromissos" ON compromissos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- links_projeto
CREATE TABLE IF NOT EXISTS links_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT DEFAULT 'outro' CHECK (tipo IN ('planta','referencia','contrato','orcamento','outro')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE links_projeto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own links" ON links_projeto
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- modelos_escritorio
CREATE TABLE IF NOT EXISTS modelos_escritorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('briefing','proposta')),
  nome TEXT NOT NULL DEFAULT 'Modelo principal',
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE modelos_escritorio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own modelos" ON modelos_escritorio
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
