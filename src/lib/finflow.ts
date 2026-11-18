// Regras puras do FinFlow (sem React) para facilitar testes.

export type DeleteScope = "single" | "future" | "all";
export type ProfileKind = "pessoal" | "negocio";

export interface FinTransaction {
  id: string;
  monthId: string;
  description: string;
  type: string;
  method?: string;
  category?: string;
  installmentInfo?: string;
  seriesId?: string;
  goalId?: string;
  amount: number;
}

/** Remove o sufixo " (2/4)" das descrições de parcelas. */
export function baseDescription(description: string): string {
  return description.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim();
}

/**
 * Identifica a qual "série" (gasto fixo ou compra parcelada) um lançamento pertence.
 * Lançamentos novos têm seriesId; lançamentos antigos são agrupados pela descrição.
 */
export function getSeriesKey(tx: FinTransaction): string | null {
  if (tx.seriesId) return tx.seriesId;
  if (tx.type === "fixo") {
    return `fixo|${tx.description.trim().toLowerCase()}|${tx.method ?? ""}|${tx.category ?? ""}`;
  }
  if (tx.type === "parcelado") {
    const total = tx.installmentInfo?.match(/\/(\d+)/)?.[1] ?? "";
    return `parcelado|${baseDescription(tx.description).toLowerCase()}|${total}|${tx.method ?? ""}`;
  }
  return null;
}

export function getSeriesMembers<T extends FinTransaction>(transactions: T[], tx: T): T[] {
  const key = getSeriesKey(tx);
  if (!key) return [tx];
  return transactions.filter((t) => getSeriesKey(t) === key);
}

/** Ids que devem ser apagados ao excluir `tx` com o alcance escolhido. */
export function selectIdsToDelete<T extends FinTransaction>(
  transactions: T[],
  tx: T,
  scope: DeleteScope,
): Set<string> {
  if (scope === "single") return new Set([tx.id]);
  const members = getSeriesMembers(transactions, tx);
  const chosen = scope === "all" ? members : members.filter((t) => t.monthId >= tx.monthId);
  return new Set(chosen.map((t) => t.id));
}

export function removeGoal<G extends { id: string }>(goals: G[], goalId: string): G[] {
  return goals.filter((g) => g.id !== goalId);
}

export function getKindLabels(kind: ProfileKind | undefined) {
  if (kind === "negocio") {
    return {
      kindLabel: "Negócio",
      income: "Faturamento",
      incomeCard: "Faturamento Previsto/Mês",
      essencial: "Custos Operacionais",
      essencialDesc: "Aluguel, fornecedores, folha, impostos",
      lazer: "Despesas Variáveis",
      lazerDesc: "Marketing, compras, serviços avulsos",
      investimento: "Reserva & Reinvestimento",
      short: { essencial: "Operacional", lazer: "Variável", investimento: "Reserva" },
    };
  }
  return {
    kindLabel: "Pessoal",
    income: "Renda",
    incomeCard: "Renda Previsto/Mês",
    essencial: "Essenciais",
    essencialDesc: "Moradia, saúde, mercado, contas fixas",
    lazer: "Desejos & Lazer",
    lazerDesc: "Compras, viagens, restaurantes",
    investimento: "Investimentos & Metas",
    short: { essencial: "Essencial", lazer: "Lazer", investimento: "Investimento" },
  };
}

// ---------- Dia de vencimento ----------

/** Dia de vencimento padrão de cada cartão (usado até a pessoa informar o dela). */
export const DEFAULT_CARD_DUE_DAYS: Record<string, number> = { nubank: 10, itau: 20 };

export function isCardMethod(method: string): boolean {
  return method in DEFAULT_CARD_DUE_DAYS;
}

/** Dia de vencimento do cartão: o que a pessoa salvou no perfil ou o padrão. */
export function getCardDueDay(method: string, cardDueDays?: Record<string, number> | null): number | null {
  if (!isCardMethod(method)) return null;
  return cardDueDays?.[method] ?? DEFAULT_CARD_DUE_DAYS[method]!;
}

/** Dia sugerido no formulário de novo lançamento. */
export function getDefaultDueDay(
  method: string,
  type: string,
  cardDueDays?: Record<string, number> | null,
): number {
  const cardDay = getCardDueDay(method, cardDueDays);
  if (cardDay) return cardDay;
  if (type === "fixo") return 5;
  if (type === "parcelado") return 10;
  return 17;
}

/** Converte o texto digitado em um dia válido (1 a 31) ou null. */
export function parseDueDay(input: string | number): number | null {
  const n = Number(String(input).trim());
  if (!Number.isInteger(n) || n < 1 || n > 31) return null;
  return n;
}

/** Monta a data "DD/MM/AAAA" do mês; dias que não existem no mês viram o último dia (ex.: 31 em fevereiro → 28). */
export function formatDueDate(day: number, monthId: string): string {
  const [year, month] = monthId.split("-").map(Number) as [number, number];
  const lastDay = new Date(year, month, 0).getDate();
  const d = Math.min(Math.max(1, day), lastDay);
  return `${String(d).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}
