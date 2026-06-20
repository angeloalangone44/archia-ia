"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function ClientQualificacaoPage() {
  const params = useParams();
  void params.token;

  const [enviado, setEnviado] = useState(false);
  const [linkResposta, setLinkResposta] = useState("");

  const [f, setF] = useState({
    nome: "",
    email: "",
    tipoProjetoQual: "",
    metragem: "",
    orcamentoFaixa: "",
    prazo: "",
    cidade: "",
    comoConheceu: "",
    descricao: "",
  });

  const TIPOS = [
    { id: "Residencial", label: "Residencial", desc: "Casa ou apartamento" },
    { id: "Comercial", label: "Comercial", desc: "Escritório, loja ou empresa" },
    { id: "Reforma", label: "Reforma", desc: "Reforma parcial ou completa" },
    { id: "Interiores", label: "Interiores", desc: "Decoração sem obra" },
  ];

  function handleEnviar() {
    if (!f.nome || !f.tipoProjetoQual || !f.descricao) {
      alert("Por favor, preencha seu nome, o tipo de projeto e a descrição.");
      return;
    }
    const payload: Record<string, string> = {
      nome: f.nome,
      email: f.email,
      tipoProjetoQual: f.tipoProjetoQual,
      metragem: f.metragem,
      orcamentoFaixa: f.orcamentoFaixa,
      prazo: f.prazo,
      cidade: f.cidade,
      comoConheceu: f.comoConheceu,
      descricao: f.descricao,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = `${window.location.origin}/app/qualificacao#client=${encoded}`;
    setLinkResposta(link);
    setEnviado(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid #D8D3CB", background: "#FFFFFF",
    fontSize: 14, color: "#1C1C1C", fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 500,
    color: "#4C4C4C", marginBottom: 6, fontFamily: "'DM Sans', system-ui, sans-serif",
  };
  const helpStyle: React.CSSProperties = {
    fontSize: 12, color: "#9B9B9B", marginTop: 5, lineHeight: 1.55,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#8B8070", marginBottom: 16,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  if (enviado) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F2ED", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "48px 40px", maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1C", marginBottom: 8, fontFamily: "Georgia, serif" }}>
            Obrigado, {f.nome.split(" ")[0]}!
          </h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28, fontFamily: "'DM Sans', sans-serif" }}>
            Suas respostas foram registradas. Envie o link abaixo para o seu arquiteto — ele vai usar essas informações para analisar se o seu projeto é uma boa parceria.
          </p>
          <div style={{ background: "#F5F2ED", borderRadius: 12, padding: "14px 16px", marginBottom: 16, wordBreak: "break-all" }}>
            <p style={{ fontSize: 11, color: "#8B6914", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
              Link para o arquiteto
            </p>
            <p style={{ fontSize: 11, color: "#4C4C4C", fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>
              {linkResposta}
            </p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(linkResposta); alert("Link copiado!"); }}
            style={{ background: "#2D5A3D", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%" }}>
            Copiar link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2ED", padding: "32px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "#8B6914", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
            archi.ia
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1C1C1C", marginBottom: 10, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Fale um pouco sobre o seu projeto
          </h1>
          <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
            Preencha este formulário para que o arquiteto entenda melhor o que você está buscando antes do primeiro contato.
          </p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {/* Dados pessoais */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Seus dados</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Seu nome *</label>
                <input style={inputStyle} placeholder="Ex: Ana Paula Ferreira" value={f.nome}
                  onChange={(e) => setF((p) => ({ ...p, nome: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>E-mail (opcional)</label>
                <input style={inputStyle} type="email" placeholder="seuemail@exemplo.com" value={f.email}
                  onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Tipo */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Sobre o projeto</h2>
            <label style={labelStyle}>Que tipo de projeto você quer fazer? *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {TIPOS.map((t) => {
                const active = f.tipoProjetoQual === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setF((p) => ({ ...p, tipoProjetoQual: t.id }))}
                    style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: active ? "2px solid #2D5A3D" : "1px solid #D8D3CB", background: active ? "#EAF2EC" : "#FFFFFF", color: active ? "#2D5A3D" : "#4C4C4C", fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
                    <div style={{ fontWeight: active ? 600 : 500 }}>{t.label}</div>
                    <div style={{ fontSize: 11, marginTop: 2, opacity: 0.75 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Cidade / bairro</label>
                <input style={inputStyle} placeholder="Ex: Moema, São Paulo" value={f.cidade}
                  onChange={(e) => setF((p) => ({ ...p, cidade: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Metragem estimada</label>
                <input style={inputStyle} placeholder="Ex: 120 m²" value={f.metragem}
                  onChange={(e) => setF((p) => ({ ...p, metragem: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Orçamento disponível</label>
                <input style={inputStyle} placeholder="Ex: R$ 150.000 ou em torno de R$ 200-300k" value={f.orcamentoFaixa}
                  onChange={(e) => setF((p) => ({ ...p, orcamentoFaixa: e.target.value }))} />
                <p style={helpStyle}>Não se preocupe em ter certeza — uma estimativa inicial já ajuda.</p>
              </div>
              <div>
                <label style={labelStyle}>Prazo desejado</label>
                <input style={inputStyle} placeholder="Ex: 8 meses, início em março" value={f.prazo}
                  onChange={(e) => setF((p) => ({ ...p, prazo: e.target.value }))} />
                <p style={helpStyle}>Se não souber, deixe em branco — o arquiteto vai te orientar.</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Como você conheceu o arquiteto?</label>
                <input style={inputStyle} placeholder="Ex: indicação de amigo, Instagram, Google..." value={f.comoConheceu}
                  onChange={(e) => setF((p) => ({ ...p, comoConheceu: e.target.value }))} />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Descrição */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Descreva em poucas linhas o que você está buscando *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
              placeholder="Ex: quero reformar meu apartamento de 90m² no Brooklin. Busco um ambiente mais integrado, com personalidade, sem ser excessivamente formal. Tenho 2 filhos pequenos e um cachorro..."
              value={f.descricao}
              onChange={(e) => setF((p) => ({ ...p, descricao: e.target.value }))}
            />
          </div>

          <button onClick={handleEnviar}
            style={{ width: "100%", background: "#2D5A3D", color: "#FFFFFF", border: "none", borderRadius: 14, padding: "15px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Enviar para o arquiteto →
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#A0A0A0", marginTop: 14, fontFamily: "'DM Sans', sans-serif" }}>
            Seus dados são usados apenas para este processo de qualificação (LGPD).
          </p>
        </div>
      </div>
    </div>
  );
}
