import { createClient } from "@/lib/supabase/client";
import { getSessionId } from "@/lib/session";

export type TipoModelo = "briefing" | "proposta";

export type ModeloEscritorio = {
  id: string;
  session_id: string;
  tipo: TipoModelo;
  nome: string;
  conteudo: string;
  created_at: string;
};

export async function getModelo(tipo: TipoModelo): Promise<ModeloEscritorio | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("modelos_escritorio")
    .select("*")
    .eq("session_id", getSessionId())
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function saveModelo(
  tipo: TipoModelo,
  conteudo: string,
  nome = "Modelo principal"
): Promise<void> {
  const supabase = createClient();
  const sid = getSessionId();
  await supabase
    .from("modelos_escritorio")
    .delete()
    .eq("session_id", sid)
    .eq("tipo", tipo);
  const { error } = await supabase
    .from("modelos_escritorio")
    .insert({ session_id: sid, tipo, nome, conteudo });
  if (error) throw error;
}

export async function deleteModelo(tipo: TipoModelo): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("modelos_escritorio")
    .delete()
    .eq("session_id", getSessionId())
    .eq("tipo", tipo);
}
