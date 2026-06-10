import { createClient } from "@/lib/supabase/client";

export type TipoModelo = "briefing" | "proposta";

export type ModeloEscritorio = {
  id: string;
  user_id: string;
  tipo: TipoModelo;
  nome: string;
  conteudo: string;
  created_at: string;
};

export async function getModelo(tipo: TipoModelo): Promise<ModeloEscritorio | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("modelos_escritorio")
    .select("*")
    .eq("user_id", user.id)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Delete old and insert new
  await supabase
    .from("modelos_escritorio")
    .delete()
    .eq("user_id", user.id)
    .eq("tipo", tipo);

  const { error } = await supabase
    .from("modelos_escritorio")
    .insert({ user_id: user.id, tipo, nome, conteudo });
  if (error) throw error;
}

export async function deleteModelo(tipo: TipoModelo): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("modelos_escritorio")
    .delete()
    .eq("user_id", user.id)
    .eq("tipo", tipo);
}
