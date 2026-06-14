"use client";

import { useParams } from "next/navigation";
import { useState, useRef } from "react";

export default function ClientBriefingPage() {
  const params = useParams();
  // token is available for future server-side lookup if needed
  void params.token;

  const [enviado, setEnviado] = useState(false);
  const [linkResposta, setLinkResposta] = useState("");

  // image upload state
  type TokenImage = { id: string; base64: string; mediaType: string; name: string; previewUrl: string };
  const [tokenImages, setTokenImages] = useState<TokenImage[]>([]);
  const [tokenAnalysis, setTokenAnalysis] = useState("");
  const [analyzingToken, setAnalyzingToken] = useState(false);
  const [tokenAnalysisError, setTokenAnalysisError] = useState("");
  const tokenImgRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState({
    nome: "",
    email: "",
    tipoDetalhado: "",
    localizacao: "",
    area: "",
    orcamento: "",
    prazo: "",
    moradores: "",
    pet: "",
    tomNeutro: "",
    corQueGosta: "",
    corQueNaoQuer: "",
    selectedRooms: [] as string[],
    referenciasVisuais: [""],
    obsGerais: "",
  });

  const TIPOS = [
    { id: "residencial-casa", label: "Casa" },
    { id: "residencial-apto", label: "Apartamento" },
    { id: "comercial", label: "Espaço comercial" },
    { id: "reforma", label: "Reforma" },
    { id: "interiores", label: "Decoração de interiores" },
  ];

  const COMODOS = [
    { id: "sala", label: "Sala de estar / jantar" },
    { id: "cozinha", label: "Cozinha" },
    { id: "quarto-casal", label: "Quarto do casal" },
    { id: "quarto-kids", label: "Quarto dos filhos" },
    { id: "banheiro", label: "Banheiro" },
    { id: "lavabo", label: "Lavabo" },
    { id: "closet", label: "Closet / guarda-roupa" },
    { id: "area-servico", label: "Área de serviço" },
    { id: "varanda", label: "Varanda" },
    { id: "home-office", label: "Home office" },
  ];

  function toggleRoom(id: string) {
    setF((prev) => ({
      ...prev,
      selectedRooms: prev.selectedRooms.includes(id)
        ? prev.selectedRooms.filter((r) => r !== id)
        : [...prev.selectedRooms, id],
    }));
  }

  async function handleTokenImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.size <= 3 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/.test(f.type));
    const remaining = 8 - tokenImages.length;
    const toAdd = files.slice(0, remaining);
    if (!toAdd.length) return;
    const newImgs = await Promise.all(toAdd.map((f) => new Promise<TokenImage>((res) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        res({ id: crypto.randomUUID(), base64: dataUrl.split(",")[1], mediaType: f.type, name: f.name, previewUrl: dataUrl });
      };
      reader.readAsDataURL(f);
    })));
    const next = [...tokenImages, ...newImgs];
    setTokenImages(next);
    e.target.value = "";
    // analyze all images
    setAnalyzingToken(true);
    setTokenAnalysisError("");
    try {
      const res = await fetch("/api/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next.map((i) => ({ base64: i.base64, mediaType: i.mediaType })) }),
      });
      const json = await res.json() as { analysis?: string; error?: string };
      if (!res.ok || json.error) setTokenAnalysisError(json.error ?? "Erro ao analisar.");
      else setTokenAnalysis(json.analysis ?? "");
    } catch { setTokenAnalysisError("Não foi possível analisar as imagens."); }
    finally { setAnalyzingToken(false); }
  }

  async function handleRemoveTokenImage(id: string) {
    const next = tokenImages.filter((i) => i.id !== id);
    setTokenImages(next);
    if (next.length === 0) { setTokenAnalysis(""); return; }
    setAnalyzingToken(true);
    try {
      const res = await fetch("/api/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: next.map((i) => ({ base64: i.base64, mediaType: i.mediaType })) }),
      });
      const json = await res.json() as { analysis?: string; error?: string };
      if (res.ok && !json.error) setTokenAnalysis(json.analysis ?? "");
    } catch { /* ignore */ }
    finally { setAnalyzingToken(false); }
  }

  function handleEnviar() {
    if (!f.nome || !f.tipoDetalhado) {
      alert("Por favor, preencha seu nome e o tipo de projeto.");
      return;
    }
    const payload: Record<string, string> = {
      nome: f.nome,
      email: f.email,
      tipoDetalhado: f.tipoDetalhado,
      localizacao: f.localizacao,
      area: f.area,
      orcamento: f.orcamento,
      prazo: f.prazo,
      moradores: f.moradores,
      pet: f.pet,
      tomNeutro: f.tomNeutro,
      corQueGosta: f.corQueGosta,
      corQueNaoQuer: f.corQueNaoQuer,
      selectedRooms: JSON.stringify(f.selectedRooms),
      referenciasVisuais: JSON.stringify(f.referenciasVisuais.filter((l) => l.trim() !== "")),
      obsGerais: f.obsGerais,
      ...(tokenAnalysis ? { analiseImagens: tokenAnalysis } : {}),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = `${window.location.origin}/app/briefing#client=${encoded}`;
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
    color: "#4C4C4C", marginBottom: 6,
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
            Suas respostas foram registradas. Envie o link abaixo para o seu arquiteto — ele vai usar esses dados para criar o briefing do projeto.
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
            style={{
              background: "#2D5A3D", color: "#FFFFFF", border: "none",
              borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%",
            }}
          >
            Copiar link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2ED", padding: "32px 16px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "#8B6914", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
            archi.ia
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1C1C1C", marginBottom: 10, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Conte-nos sobre o seu projeto
          </h1>
          <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
            Preencha este formulário para que seu arquiteto entenda melhor o que você imagina para o seu espaço.
          </p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {/* Dados */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Seus dados</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Seu nome *</label>
                <input style={inputStyle} placeholder="Ex: Maria Fernanda" value={f.nome}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {TIPOS.map((t) => {
                const active = f.tipoDetalhado === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setF((p) => ({ ...p, tipoDetalhado: t.id }))}
                    style={{
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                      border: active ? "2px solid #2D5A3D" : "1px solid #D8D3CB",
                      background: active ? "#EAF2EC" : "#FFFFFF",
                      color: active ? "#2D5A3D" : "#4C4C4C",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                    }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Onde fica o imóvel?</label>
                <input style={inputStyle} placeholder="Ex: Moema, SP" value={f.localizacao}
                  onChange={(e) => setF((p) => ({ ...p, localizacao: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Área aproximada</label>
                <input style={inputStyle} placeholder="Ex: 120 m²" value={f.area}
                  onChange={(e) => setF((p) => ({ ...p, area: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Orçamento disponível</label>
                <select style={inputStyle} value={f.orcamento}
                  onChange={(e) => setF((p) => ({ ...p, orcamento: e.target.value }))}>
                  <option value="">Selecione...</option>
                  <option>Até R$ 100.000</option>
                  <option>R$ 100.000 – R$ 300.000</option>
                  <option>R$ 300.000 – R$ 500.000</option>
                  <option>Acima de R$ 500.000</option>
                  <option>Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Em quanto tempo quer terminar?</label>
                <input style={inputStyle} placeholder="Ex: 8 meses" value={f.prazo}
                  onChange={(e) => setF((p) => ({ ...p, prazo: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Quem vai morar?</label>
                <input style={inputStyle} placeholder="Ex: casal + 1 filho" value={f.moradores}
                  onChange={(e) => setF((p) => ({ ...p, moradores: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Tem pet?</label>
                <select style={inputStyle} value={f.pet}
                  onChange={(e) => setF((p) => ({ ...p, pet: e.target.value }))}>
                  <option value="">—</option>
                  <option>Sim</option>
                  <option>Não</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Estilo */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Seu estilo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Entre tons neutros, qual prefere?</label>
                <select style={inputStyle} value={f.tomNeutro}
                  onChange={(e) => setF((p) => ({ ...p, tomNeutro: e.target.value }))}>
                  <option value="">—</option>
                  <option>Cinza</option>
                  <option>Bege</option>
                  <option>Sem preferência</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Qual cor você mais gosta?</label>
                <input style={inputStyle} placeholder="Ex: verde escuro, azul..." value={f.corQueGosta}
                  onChange={(e) => setF((p) => ({ ...p, corQueGosta: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Qual cor você definitivamente NÃO quer?</label>
                <input style={inputStyle} placeholder="Ex: amarelo, laranja..." value={f.corQueNaoQuer}
                  onChange={(e) => setF((p) => ({ ...p, corQueNaoQuer: e.target.value }))} />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Cômodos */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Quais cômodos fazem parte do projeto?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {COMODOS.map((c) => {
                const checked = f.selectedRooms.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => toggleRoom(c.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                      border: checked ? "2px solid #2D5A3D" : "1px solid #D8D3CB",
                      background: checked ? "#EAF2EC" : "#FFFFFF",
                      color: checked ? "#2D5A3D" : "#4C4C4C",
                      fontSize: 13, fontWeight: checked ? 500 : 400,
                      fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: checked ? "#2D5A3D" : "transparent",
                      border: checked ? "none" : "1.5px solid #C0BAB0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/></svg>}
                    </div>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Referências visuais */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Referências visuais (opcional)</h2>
            <label style={labelStyle}>Cole links de imagens ou painéis que inspiram o projeto</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(f.referenciasVisuais.length > 0 ? f.referenciasVisuais : [""]).map((link, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const next = [...(f.referenciasVisuais.length > 0 ? f.referenciasVisuais : [""])];
                      next[i] = e.target.value;
                      setF((p) => ({ ...p, referenciasVisuais: next }));
                    }}
                    placeholder="Ex: link do Pinterest, Instagram, Google Drive..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {(f.referenciasVisuais.length > 0 ? f.referenciasVisuais : [""]).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = f.referenciasVisuais.filter((_, idx) => idx !== i);
                        setF((p) => ({ ...p, referenciasVisuais: next.length > 0 ? next : [""] }));
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#A0A0A0", fontSize: 18, lineHeight: 1 }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {(f.referenciasVisuais.length < 10) && (
              <button
                type="button"
                onClick={() => setF((p) => ({ ...p, referenciasVisuais: [...(p.referenciasVisuais.length > 0 ? p.referenciasVisuais : [""]), ""] }))}
                style={{
                  marginTop: 10, background: "#F5F2ED", border: "1px solid #D8D3CB",
                  borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#4C4C4C",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>
                + Adicionar link
              </button>
            )}
            <p style={{ fontSize: 12, color: "#9B9B9B", marginTop: 8, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              Cole links de imagens, painéis do Pinterest ou pastas do Drive com referências que inspiram
              o projeto — seu arquiteto vai usar para entender seu estilo.
            </p>
          </div>

          {/* Upload de imagens */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Fotos de referência (opcional)</h2>
            <p style={{ fontSize: 13, color: "#4C4C4C", marginBottom: 14, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              Envie até 8 fotos de ambientes, projetos ou estilos que você admira — isso ajuda muito o arquiteto a entender o seu gosto.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              {tokenImages.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  <img src={img.previewUrl} alt={img.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #D8D3CB" }} />
                  <button
                    type="button"
                    onClick={() => handleRemoveTokenImage(img.id)}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#DC2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
                    ×
                  </button>
                </div>
              ))}
              {tokenImages.length < 8 && (
                <button
                  type="button"
                  onClick={() => tokenImgRef.current?.click()}
                  style={{ width: 80, height: 80, borderRadius: 10, border: "1.5px dashed #D8D3CB", background: "#F5F2ED", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "#8B8070", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 22, height: 22 }}><path d="M12 4v16m8-8H4"/></svg>
                  Adicionar
                </button>
              )}
            </div>
            <input ref={tokenImgRef} type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleTokenImages} />

            {analyzingToken && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B6B6B", padding: "10px 14px", borderRadius: 10, background: "#F5F2ED", marginBottom: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #D8D3CB", borderTopColor: "#2D5A3D", animation: "spin 0.8s linear infinite" }} />
                Analisando imagens com IA...
              </div>
            )}

            {!analyzingToken && tokenAnalysisError && (
              <div style={{ fontSize: 12, color: "#C0392B", padding: "10px 14px", borderRadius: 10, background: "#FDEDEC", border: "1px solid #F5B7B1", marginBottom: 10 }}>
                {tokenAnalysisError}
              </div>
            )}

            {!analyzingToken && tokenAnalysis && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F0F8F2", border: "1px solid #A8D5B2", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#2D5A3D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                  📸 O que identificamos nas suas referências:
                </p>
                <p style={{ fontSize: 13, color: "#3A5A3A", lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  {tokenAnalysis}
                </p>
              </div>
            )}

            <p style={{ fontSize: 12, color: "#9B9B9B", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              As imagens são analisadas para gerar este relatório e não são armazenadas (LGPD). Máx. 8 fotos · JPG, PNG ou WebP · até 3MB cada.
            </p>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E0D8", margin: "24px 0" }} />

          {/* Obs */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Alguma observação especial para o projeto?</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              placeholder="Ex: quero um espaço aconchegante, tenho filhos pequenos, gosto de verde..."
              value={f.obsGerais}
              onChange={(e) => setF((p) => ({ ...p, obsGerais: e.target.value }))}
            />
          </div>

          <button onClick={handleEnviar}
            style={{
              width: "100%", background: "#2D5A3D", color: "#FFFFFF",
              border: "none", borderRadius: 14, padding: "15px 28px",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            Enviar para o arquiteto →
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#A0A0A0", marginTop: 14, fontFamily: "'DM Sans', sans-serif" }}>
            Seus dados são usados apenas para este projeto (LGPD).
          </p>
        </div>
      </div>
    </div>
  );
}
