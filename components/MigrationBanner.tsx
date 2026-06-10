"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createProjeto } from "@/lib/db/projetos";

export default function MigrationBanner() {
  const [show, setShow] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const migrated = localStorage.getItem("archia_migrated_v1");
    if (migrated) return;

    const hasProjetos =
      localStorage.getItem("archia_projetos") ||
      localStorage.getItem("archia_v2_projetos");

    if (hasProjetos) {
      try {
        const raw =
          localStorage.getItem("archia_v2_projetos") ||
          localStorage.getItem("archia_projetos") ||
          "[]";
        const projetos = JSON.parse(raw);
        if (Array.isArray(projetos) && projetos.length > 0) setShow(true);
      } catch {}
    }
  }, []);

  async function handleMigrate() {
    setMigrating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("não autenticado");

      const raw =
        localStorage.getItem("archia_v2_projetos") ||
        localStorage.getItem("archia_projetos") ||
        "[]";
      const projetos = JSON.parse(raw);

      for (const p of projetos) {
        await createProjeto({
          escritorio_id: null,
          cliente_nome: p.cliente?.nome || p.nomeCliente || "Cliente importado",
          cliente_email: p.cliente?.email || null,
          localizacao: p.cliente?.localizacao || p.localizacao || null,
          moradores: p.cliente?.moradores || null,
          pet: p.cliente?.pet || null,
          tipo_projeto: p.projeto?.tipo || p.tipo || null,
          area: p.projeto?.area || p.area || null,
          orcamento: p.projeto?.orcamento || p.orcamento || null,
          prazo: p.projeto?.prazo || p.prazo || null,
          perfil_estetico: p.cliente?.perfilEstetico || null,
          ambientes: p.ambientes || null,
          status_etapa: "briefing",
          etapas_status: null,
        });
      }

      localStorage.setItem("archia_migrated_v1", "true");
      setDone(true);
      setTimeout(() => setShow(false), 3000);
    } catch (err) {
      console.error("Migração falhou:", err);
    }
    setMigrating(false);
  }

  function handleDismiss() {
    localStorage.setItem("archia_migrated_v1", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        maxWidth: "440px",
        width: "calc(100vw - 48px)",
      }}
    >
      {done ? (
        <p style={{ margin: 0, fontSize: "14px", color: "var(--accent)", fontWeight: 500 }}>
          ✓ Dados migrados com sucesso para sua conta.
        </p>
      ) : (
        <>
          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--ink)", fontWeight: 500 }}>
            Encontramos dados locais
          </p>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--ink2)" }}>
            Você tem projetos salvos no navegador. Deseja migrar para sua conta e acessar de qualquer dispositivo?
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: migrating ? 0.7 : 1,
              }}
            >
              {migrating ? "Migrando..." : "Migrar dados"}
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "var(--ink2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Ignorar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
