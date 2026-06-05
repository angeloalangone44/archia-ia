"use client";

import { useEffect, useState } from "react";
import { getConfiguracoes, saveConfiguracoes } from "@/lib/configuracoes";
import { Input, FormGroup, SectionDivider } from "@/components/DocumentForm";

export default function ConfiguracoesPage() {
  const [f, setF] = useState({
    valorHora:    "",
    horasMensais: "",
    margemLucro:  "",
    custosFixos:  "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getConfiguracoes();
    if (c) {
      setF({
        valorHora:    String(c.valorHora    || ""),
        horasMensais: String(c.horasMensais || ""),
        margemLucro:  String(c.margemLucro  || ""),
        custosFixos:  String(c.custosFixos  || ""),
      });
    }
  }, []);

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setF((prev) => ({ ...prev, [k]: e.target.value }));

  function handleSave() {
    if (!f.valorHora) { alert("Informe o valor da sua hora."); return; }
    saveConfiguracoes({
      valorHora:    parseFloat(f.valorHora)    || 0,
      horasMensais: parseFloat(f.horasMensais) || 0,
      margemLucro:  parseFloat(f.margemLucro)  || 0,
      custosFixos:  parseFloat(f.custosFixos)  || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>Configurações</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Perfil do escritório — salvo localmente no seu navegador
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "0.5px solid var(--border)", background: "var(--surface)" }}>
        <div className="px-6 pt-5 pb-4">
          <SectionDivider>Precificação do escritório</SectionDivider>
          <p className="text-[12px] mb-5" style={{ color: "var(--ink3)", lineHeight: 1.6 }}>
            Configure uma vez — a calculadora usa esses valores como base para todos os projetos.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Valor da sua hora (R$)" required>
              <Input
                type="number"
                placeholder="Ex: 150"
                value={f.valorHora}
                onChange={set("valorHora")}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Quanto você cobra ou quer cobrar por hora de trabalho
              </p>
            </FormGroup>

            <FormGroup label="Horas disponíveis por mês">
              <Input
                type="number"
                placeholder="Ex: 120"
                value={f.horasMensais}
                onChange={set("horasMensais")}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Horas dedicadas a projetos, descontando reuniões e admin
              </p>
            </FormGroup>

            <FormGroup label="Margem de lucro desejada (%)">
              <Input
                type="number"
                placeholder="Ex: 30"
                value={f.margemLucro}
                onChange={set("margemLucro")}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Percentual de lucro acima do seu custo operacional
              </p>
            </FormGroup>

            <FormGroup label="Custos fixos mensais (R$)">
              <Input
                type="number"
                placeholder="Ex: 2000"
                value={f.custosFixos}
                onChange={set("custosFixos")}
              />
              <p className="text-[11px] mt-1" style={{ color: "var(--ink3)" }}>
                Aluguel, softwares, contador, etc. — melhora a precisão
              </p>
            </FormGroup>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-[13px] font-medium text-white px-5 py-2.5 rounded-xl"
              style={{ background: "var(--accent)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Salvar configurações
            </button>
            {saved && (
              <span className="text-[12px] flex items-center gap-1.5" style={{ color: "#2D5A3D" }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Salvo com sucesso
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
