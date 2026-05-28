import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "archi.ia — Assistente para arquitetos",
  description:
    "Briefing técnico, caderno de especificações e proposta comercial gerados por IA em minutos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
