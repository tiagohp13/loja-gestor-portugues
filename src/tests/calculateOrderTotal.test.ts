import { describe, it, expect } from "vitest";

/**
 * Função que calcula o total de uma encomenda
 * Soma quantity * unit_price de cada item
 */
function calculateOrderTotal(items: Array<{ quantity: number; unit_price: number }>) {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

describe("calculateOrderTotal", () => {
  it("deve somar corretamente o total da encomenda", () => {
    const items = [
      { quantity: 2, unit_price: 10 },
      { quantity: 1, unit_price: 5 },
    ];
    expect(calculateOrderTotal(items)).toBe(25);
  });

  it("deve retornar 0 se a encomenda estiver vazia", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });

  it("deve lidar com valores decimais corretamente", () => {
    const items = [
      { quantity: 2, unit_price: 10.50 },
      { quantity: 3, unit_price: 7.25 },
    ];
    expect(calculateOrderTotal(items)).toBe(42.75);
  });

  it("deve lidar com quantidades decimais", () => {
    const items = [
      { quantity: 1.5, unit_price: 10 },
      { quantity: 2.5, unit_price: 4 },
    ];
    expect(calculateOrderTotal(items)).toBe(25);
  });
});
