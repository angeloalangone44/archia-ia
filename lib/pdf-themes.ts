export type TemaDocumento = "classico" | "minimalista" | "terracota" | "azul" | "salvia";

export type TemaConfig = {
  id: TemaDocumento;
  nome: string;
  desc: string;
  preview: { bg: string; border: string; heading: string; body: string; accent: string };
  css: string;
};

export const PDF_THEMES: TemaConfig[] = [
  {
    id: "classico",
    nome: "Clássico",
    desc: "Serif · branco · linha verde",
    preview: { bg: "#FFFFFF", border: "#D8D0C0", heading: "#1A1410", body: "#3C3530", accent: "#2D5A3D" },
    css: `
#archia-doc.tpl-classico {
  font-family: Georgia, 'Times New Roman', serif;
  background: #FFFFFF;
  color: #1A1410;
  padding: 56px 72px;
}
#archia-doc.tpl-classico .doc-logo {
  font-family: Georgia, serif;
  font-size: 18px;
  letter-spacing: -0.5px;
  color: #2D5A3D;
  text-align: left;
  border-bottom: 2px solid #2D5A3D;
  padding-bottom: 16px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
#archia-doc.tpl-classico .doc-logo span {
  display: inline;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6B8C70;
  margin-left: 6px;
  font-family: 'DM Sans', system-ui, sans-serif;
}
#archia-doc.tpl-classico h1, #archia-doc.tpl-classico h2 {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #1A1410; margin: 28px 0 10px;
  padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.09);
}
#archia-doc.tpl-classico h3 {
  font-size: 13px; font-weight: 600; color: #2D5A3D;
  margin: 16px 0 6px;
}
#archia-doc.tpl-classico p {
  font-size: 13px; line-height: 1.85; color: #3C3530; margin: 8px 0;
}
#archia-doc.tpl-classico ul, #archia-doc.tpl-classico ol {
  padding-left: 20px; margin: 8px 0;
}
#archia-doc.tpl-classico li {
  font-size: 13px; line-height: 1.75; color: #3C3530; margin: 4px 0;
}
#archia-doc.tpl-classico strong { font-weight: 700; color: #1A1410; }
#archia-doc.tpl-classico em { font-style: italic; }
#archia-doc.tpl-classico hr { border: none; border-top: 1px solid #D8D0C0; margin: 24px 0; }
#archia-doc.tpl-classico blockquote {
  border-left: 3px solid #2D5A3D; padding-left: 16px;
  color: #7A6A50; font-style: italic; margin: 12px 0;
}`,
  },

  {
    id: "minimalista",
    nome: "Minimalista",
    desc: "Sans-serif · preto e cinza · muito espaço",
    preview: { bg: "#FFFFFF", border: "#E8E8E8", heading: "#111111", body: "#555555", accent: "#111111" },
    css: `
#archia-doc.tpl-minimalista {
  font-family: 'DM Sans', Helvetica, Arial, system-ui, sans-serif;
  background: #FFFFFF;
  color: #111111;
  padding: 64px 80px;
}
#archia-doc.tpl-minimalista .doc-logo {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #111111;
  margin-bottom: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
}
#archia-doc.tpl-minimalista .doc-logo span {
  display: inline;
  font-size: 11px;
  color: #999999;
  margin-left: 6px;
}
#archia-doc.tpl-minimalista h1, #archia-doc.tpl-minimalista h2 {
  font-size: 13px; font-weight: 500;
  letter-spacing: 0.02em; text-transform: none;
  color: #111111; margin: 36px 0 12px;
  padding-top: 0; border-top: none;
  border-bottom: 1px solid #EBEBEB;
  padding-bottom: 8px;
}
#archia-doc.tpl-minimalista h3 {
  font-size: 13px; font-weight: 600; color: #111111;
  margin: 20px 0 6px;
}
#archia-doc.tpl-minimalista p {
  font-size: 13px; line-height: 2; color: #444444; margin: 10px 0;
}
#archia-doc.tpl-minimalista ul, #archia-doc.tpl-minimalista ol {
  padding-left: 18px; margin: 10px 0;
}
#archia-doc.tpl-minimalista li {
  font-size: 13px; line-height: 1.9; color: #444444; margin: 5px 0;
}
#archia-doc.tpl-minimalista strong { font-weight: 600; color: #111111; }
#archia-doc.tpl-minimalista em { font-style: italic; color: #555555; }
#archia-doc.tpl-minimalista hr { border: none; border-top: 1px solid #EBEBEB; margin: 28px 0; }
#archia-doc.tpl-minimalista blockquote {
  border-left: 2px solid #CCCCCC; padding-left: 18px;
  color: #888888; font-style: normal; margin: 16px 0;
}`,
  },

  {
    id: "terracota",
    nome: "Terracota",
    desc: "Serif · off-white quente · acento terracota",
    preview: { bg: "#F5F1EC", border: "#E0D4C8", heading: "#2A1F18", body: "#5C4A3A", accent: "#C4654A" },
    css: `
#archia-doc.tpl-terracota {
  font-family: Georgia, 'Times New Roman', serif;
  background: #F5F1EC;
  color: #2A1F18;
  padding: 56px 72px;
}
#archia-doc.tpl-terracota .doc-logo {
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -0.3px;
  color: #C4654A;
  margin-bottom: 32px;
  border-bottom: 1.5px solid #C4654A;
  padding-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
#archia-doc.tpl-terracota .doc-logo span {
  display: inline;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #A07060;
  margin-left: 6px;
  font-family: 'DM Sans', system-ui, sans-serif;
}
#archia-doc.tpl-terracota h1, #archia-doc.tpl-terracota h2 {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #C4654A; margin: 32px 0 10px;
  padding-top: 20px; border-top: 0.5px solid #D8C8BC;
}
#archia-doc.tpl-terracota h3 {
  font-size: 13px; font-weight: 600; color: #2A1F18;
  font-style: italic; margin: 16px 0 6px;
}
#archia-doc.tpl-terracota p {
  font-size: 13px; line-height: 1.85; color: #5C4A3A; margin: 8px 0;
}
#archia-doc.tpl-terracota ul, #archia-doc.tpl-terracota ol {
  padding-left: 20px; margin: 8px 0;
}
#archia-doc.tpl-terracota li {
  font-size: 13px; line-height: 1.75; color: #5C4A3A; margin: 4px 0;
}
#archia-doc.tpl-terracota strong { font-weight: 700; color: #2A1F18; }
#archia-doc.tpl-terracota em { font-style: italic; color: #8A6A58; }
#archia-doc.tpl-terracota hr { border: none; border-top: 0.5px solid #D8C8BC; margin: 24px 0; }
#archia-doc.tpl-terracota blockquote {
  border-left: 3px solid #C4654A; padding-left: 16px;
  color: #8A6A58; font-style: italic; margin: 12px 0;
}`,
  },

  {
    id: "azul",
    nome: "Azul corporativo",
    desc: "Sans-serif · branco · azul marinho",
    preview: { bg: "#FFFFFF", border: "#D8E4EE", heading: "#1A3A5C", body: "#3A4A5A", accent: "#1A3A5C" },
    css: `
#archia-doc.tpl-azul {
  font-family: 'DM Sans', Helvetica, Arial, system-ui, sans-serif;
  background: #FFFFFF;
  color: #1A2A3A;
  padding: 56px 72px;
}
#archia-doc.tpl-azul .doc-logo {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FFFFFF;
  background: #1A3A5C;
  padding: 14px 20px;
  margin: -56px -72px 32px -72px;
  display: flex;
  align-items: center;
  gap: 12px;
}
#archia-doc.tpl-azul .doc-logo span {
  display: inline;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.65);
  margin-left: 8px;
}
#archia-doc.tpl-azul h1, #archia-doc.tpl-azul h2 {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #1A3A5C; margin: 28px 0 10px;
  padding-top: 18px;
  border-top: 2px solid #1A3A5C;
}
#archia-doc.tpl-azul h3 {
  font-size: 13px; font-weight: 600; color: #1A3A5C;
  margin: 16px 0 6px;
  padding-left: 10px;
  border-left: 3px solid #1A3A5C;
}
#archia-doc.tpl-azul p {
  font-size: 13px; line-height: 1.75; color: #3A4A5A; margin: 8px 0;
}
#archia-doc.tpl-azul ul, #archia-doc.tpl-azul ol {
  padding-left: 20px; margin: 8px 0;
}
#archia-doc.tpl-azul li {
  font-size: 13px; line-height: 1.7; color: #3A4A5A; margin: 4px 0;
}
#archia-doc.tpl-azul strong { font-weight: 700; color: #1A2A3A; }
#archia-doc.tpl-azul em { font-style: italic; color: #4A5A6A; }
#archia-doc.tpl-azul hr { border: none; border-top: 1px solid #D8E4EE; margin: 24px 0; }
#archia-doc.tpl-azul blockquote {
  border-left: 3px solid #1A3A5C; padding-left: 16px;
  color: #5A7A9A; font-style: italic; margin: 12px 0;
  background: #F0F5FA; padding: 10px 16px; border-radius: 0 6px 6px 0;
}`,
  },

  {
    id: "salvia",
    nome: "Verde sálvia",
    desc: "Serif · off-white esverdeado · orgânico",
    preview: { bg: "#F0F2EE", border: "#D4DDD0", heading: "#2A3028", body: "#485A44", accent: "#7C9070" },
    css: `
#archia-doc.tpl-salvia {
  font-family: Georgia, 'Times New Roman', serif;
  background: #F0F2EE;
  color: #2A3028;
  padding: 56px 72px;
}
#archia-doc.tpl-salvia .doc-logo {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.2px;
  color: #7C9070;
  margin-bottom: 30px;
  padding-bottom: 14px;
  border-bottom: 1px solid #C4D4BC;
  display: flex;
  align-items: center;
  gap: 12px;
}
#archia-doc.tpl-salvia .doc-logo span {
  display: inline;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8CAA80;
  margin-left: 6px;
  font-family: 'DM Sans', system-ui, sans-serif;
}
#archia-doc.tpl-salvia h1, #archia-doc.tpl-salvia h2 {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #7C9070; margin: 30px 0 10px;
  padding-top: 18px; border-top: 0.5px solid #C4D4BC;
}
#archia-doc.tpl-salvia h3 {
  font-size: 13px; font-weight: 600; color: #2A3028;
  margin: 16px 0 6px;
}
#archia-doc.tpl-salvia p {
  font-size: 13px; line-height: 1.85; color: #485A44; margin: 8px 0;
}
#archia-doc.tpl-salvia ul, #archia-doc.tpl-salvia ol {
  padding-left: 20px; margin: 8px 0;
}
#archia-doc.tpl-salvia li {
  font-size: 13px; line-height: 1.75; color: #485A44; margin: 4px 0;
}
#archia-doc.tpl-salvia strong { font-weight: 700; color: #2A3028; }
#archia-doc.tpl-salvia em { font-style: italic; color: #6A8064; }
#archia-doc.tpl-salvia hr { border: none; border-top: 0.5px solid #C4D4BC; margin: 24px 0; }
#archia-doc.tpl-salvia blockquote {
  border-left: 3px solid #7C9070; padding-left: 16px;
  color: #6A8064; font-style: italic; margin: 12px 0;
}`,
  },
];

export const DEFAULT_TEMA: TemaDocumento = "classico";

export function getTema(id?: TemaDocumento): TemaConfig {
  return PDF_THEMES.find((t) => t.id === id) ?? PDF_THEMES[0];
}
