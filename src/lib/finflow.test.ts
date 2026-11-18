import { describe, expect, it } from "vitest";
import { formatDueDate, getDefaultDueDay, parseDueDay, removeGoal, selectIdsToDelete, type FinTransaction } from "./finflow";

const fixo = (id: string, monthId: string, extra: Partial<FinTransaction> = {}): FinTransaction => ({
  id, monthId, description: "Aluguel", type: "fixo", method: "conta", category: "essencial", amount: 1000, ...extra,
});

describe("excluir gasto fixo", () => {
  const txs = [
    fixo("a", "2026-11"), fixo("b", "2026-12"), fixo("c", "2027-01"),
    fixo("x", "2026-12", { description: "Internet" }),
  ];

  it("'todos os meses' apaga o gasto fixo de todos os meses", () => {
    expect([...selectIdsToDelete(txs, txs[1]!, "all")].sort()).toEqual(["a", "b", "c"]);
  });

  it("'este e os próximos' mantém os meses anteriores", () => {
    expect([...selectIdsToDelete(txs, txs[1]!, "future")].sort()).toEqual(["b", "c"]);
  });

  it("'só este mês' apaga apenas o lançamento escolhido", () => {
    expect([...selectIdsToDelete(txs, txs[1]!, "single")]).toEqual(["b"]);
  });
});

describe("excluir parcelas", () => {
  it("apaga todas as parcelas da mesma compra, inclusive lançamentos antigos sem seriesId", () => {
    const p = (id: string, n: number, monthId: string): FinTransaction => ({
      id, monthId, description: `Monitor (${n}/3)`, type: "parcelado", method: "nubank",
      installmentInfo: `Parcela ${n}/3`, amount: 100,
    });
    const txs = [p("p1", 1, "2026-11"), p("p2", 2, "2026-12"), p("p3", 3, "2027-01")];
    expect([...selectIdsToDelete(txs, txs[0]!, "all")].sort()).toEqual(["p1", "p2", "p3"]);
  });

  it("não mistura séries diferentes com a mesma descrição quando há seriesId", () => {
    const txs = [
      fixo("s1", "2026-11", { seriesId: "series-1" }),
      fixo("s2", "2026-12", { seriesId: "series-1" }),
      fixo("o1", "2026-11", { seriesId: "series-2" }),
    ];
    expect([...selectIdsToDelete(txs, txs[0]!, "all")].sort()).toEqual(["s1", "s2"]);
  });
});

describe("excluir caixinha", () => {
  it("remove apenas a caixinha escolhida", () => {
    const goals = [{ id: "g1" }, { id: "g2" }];
    expect(removeGoal(goals, "g1")).toEqual([{ id: "g2" }]);
  });
});

describe("dia de vencimento do cartão", () => {
  it("usa o dia que a pessoa salvou para o cartão", () => {
    expect(getDefaultDueDay("nubank", "avista", { nubank: 15 })).toBe(15);
  });

  it("sem dia salvo, usa o padrão do cartão (Nubank 10, Itaú 20)", () => {
    expect(getDefaultDueDay("nubank", "parcelado", {})).toBe(10);
    expect(getDefaultDueDay("itau", "fixo")).toBe(20);
  });

  it("gasto fixo no cartão vence no dia do cartão, não no dia 5", () => {
    expect(getDefaultDueDay("itau", "fixo", { itau: 25 })).toBe(25);
  });

  it("monta a data no mês escolhido", () => {
    expect(formatDueDate(15, "2026-12")).toBe("15/12/2026");
  });

  it("dia 31 em fevereiro vira o último dia do mês", () => {
    expect(formatDueDate(31, "2027-02")).toBe("28/02/2027");
  });

  it("só aceita dias de 1 a 31", () => {
    expect(parseDueDay("0")).toBeNull();
    expect(parseDueDay("32")).toBeNull();
    expect(parseDueDay("12")).toBe(12);
  });
});
