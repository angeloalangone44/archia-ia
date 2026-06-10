import { createClient } from "@/lib/supabase/client";
import { getSessionId } from "@/lib/session";

export type TipoLink = "planta" | "referencia" | "contrato" | "orcamento" | "outro";

export type LinkProjeto = {
  id: string;
  projeto_id: string;
  session_id: string;
  titulo: string;
  url: string;
  tipo: TipoLink;
  created_at: string;
};

export async function getLinksByProjeto(projetoId: string): Promise<LinkProjeto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_projeto")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addLink(
  link: Omit<LinkProjeto, "id" | "session_id" | "created_at">
): Promise<LinkProjeto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links_projeto")
    .insert({ ...link, session_id: getSessionId() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("links_projeto").delete().eq("id", id);
  if (error) throw error;
}
