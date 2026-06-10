import { createClient } from "@/lib/supabase/client";

export type ProjetoSupabase = {
  id: string;
  escritorio_id: string | null;
  user_id: string;
  cliente_nome: string;
  cliente_email: string | null;
  localizacao: string | null;
  moradores: string | null;
  pet: string | null;
  tipo_projeto: string | null;
  area: string | null;
  orcamento: string | null;
  prazo: string | null;
  perfil_estetico: Record<string, unknown> | null;
  ambientes: Record<string, unknown> | null;
  status_etapa: string | null;
  etapas_status: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export async function getProjetos(): Promise<ProjetoSupabase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProjetoById(id: string): Promise<ProjetoSupabase | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createProjeto(
  projeto: Omit<ProjetoSupabase, "id" | "user_id" | "created_at" | "updated_at">
): Promise<ProjetoSupabase> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("projetos")
    .insert({ ...projeto, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProjeto(
  id: string,
  updates: Partial<ProjetoSupabase>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("projetos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProjeto(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projetos").delete().eq("id", id);
  if (error) throw error;
}
