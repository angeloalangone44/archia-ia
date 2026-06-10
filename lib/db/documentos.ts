import { createClient } from "@/lib/supabase/client";
import { getSessionId } from "@/lib/session";

export type TipoDocumento = "briefing" | "proposta" | "specs" | "qualificacao" | "calculo";

export type DocumentoSupabase = {
  id: string;
  projeto_id: string | null;
  session_id: string;
  tipo: TipoDocumento;
  conteudo: string;
  dados_entrada: Record<string, unknown> | null;
  created_at: string;
};

export async function getDocumentosByProjeto(
  projetoId: string
): Promise<DocumentoSupabase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveDocumento(
  doc: Omit<DocumentoSupabase, "id" | "session_id" | "created_at">
): Promise<DocumentoSupabase> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documentos")
    .upsert(
      { ...doc, session_id: getSessionId() },
      { onConflict: "projeto_id,tipo", ignoreDuplicates: false }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocumento(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("documentos").delete().eq("id", id);
  if (error) throw error;
}
