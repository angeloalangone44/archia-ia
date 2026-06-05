export type ConfiguracaoEscritorio = {
  valorHora: number;
  horasMensais: number;
  margemLucro: number;
  custosFixos: number;
};

const KEY = "archia_config_escritorio";

export function getConfiguracoes(): ConfiguracaoEscritorio | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConfiguracoes(c: ConfiguracaoEscritorio): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function hasConfiguracoes(): boolean {
  const c = getConfiguracoes();
  return c !== null && c.valorHora > 0;
}
