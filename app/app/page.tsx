import ProjectPanel from "@/components/ProjectPanel";

export default function AppPage() {
  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Projetos e Clientes
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
          Documentos gerados ficam salvos aqui no seu navegador
        </p>
      </div>
      <ProjectPanel />
    </div>
  );
}
