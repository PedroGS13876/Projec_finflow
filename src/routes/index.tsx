import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import FinFlowApp from "@/components/finflow/FinFlowApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinFlow — Controle Financeiro Pessoal e do Negócio" },
      {
        name: "description",
        content:
          "Organize gastos fixos, parcelas, faturas de cartão e caixinhas, com perfis separados para suas finanças pessoais e do seu negócio.",
      },
      { property: "og:title", content: "FinFlow — Controle Financeiro Pessoal e do Negócio" },
      {
        property: "og:description",
        content: "Gastos fixos, parcelas, faturas e caixinhas, sem misturar o pessoal com o profissional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Os dados ficam no navegador (localStorage), então o app só é montado depois de carregar no cliente.
function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-slate-950" />;
  return <FinFlowApp />;
}
