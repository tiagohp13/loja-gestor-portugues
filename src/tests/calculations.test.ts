import { describe, it, expect } from "vitest";

/**
 * Testes para validar cálculos críticos do sistema
 * Estes testes protegem as regras de negócio relacionadas com cálculos financeiros
 */

describe("Cálculos de desconto", () => {
  const applyDiscount = (price: number, discountPercent: number) => {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error("Desconto deve estar entre 0 e 100");
    }
    return price * (1 - discountPercent / 100);
  };

  it("deve aplicar desconto de 10% corretamente", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });

  it("deve aplicar desconto de 50% corretamente", () => {
    expect(applyDiscount(100, 50)).toBe(50);
  });

  it("deve retornar o mesmo valor com desconto 0%", () => {
    expect(applyDiscount(100, 0)).toBe(100);
  });

  it("deve retornar 0 com desconto 100%", () => {
    expect(applyDiscount(100, 100)).toBe(0);
  });

  it("deve lançar erro com desconto negativo", () => {
    expect(() => applyDiscount(100, -10)).toThrow("Desconto deve estar entre 0 e 100");
  });

  it("deve lançar erro com desconto superior a 100%", () => {
    expect(() => applyDiscount(100, 150)).toThrow("Desconto deve estar entre 0 e 100");
  });
});

describe("Cálculos de stock", () => {
  const calculateStockAfterEntry = (currentStock: number, entryQuantity: number) => {
    return currentStock + entryQuantity;
  };

  const calculateStockAfterExit = (currentStock: number, exitQuantity: number) => {
    if (exitQuantity > currentStock) {
      throw new Error("Quantidade de saída superior ao stock disponível");
    }
    return currentStock - exitQuantity;
  };

  it("deve adicionar stock corretamente", () => {
    expect(calculateStockAfterEntry(10, 5)).toBe(15);
  });

  it("deve subtrair stock corretamente", () => {
    expect(calculateStockAfterExit(10, 3)).toBe(7);
  });

  it("deve lançar erro ao tentar vender mais do que o stock disponível", () => {
    expect(() => calculateStockAfterExit(5, 10)).toThrow("Quantidade de saída superior ao stock disponível");
  });

  it("deve permitir vender todo o stock", () => {
    expect(calculateStockAfterExit(10, 10)).toBe(0);
  });
});

describe("Cálculos de totais com múltiplos itens", () => {
  interface OrderItem {
    quantity: number;
    unit_price: number;
    discount_percent?: number;
  }

  const calculateItemTotal = (item: OrderItem) => {
    const discount = item.discount_percent || 0;
    return item.quantity * item.unit_price * (1 - discount / 100);
  };

  const calculateOrderTotal = (items: OrderItem[], globalDiscount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    return subtotal * (1 - globalDiscount / 100);
  };

  it("deve calcular total de encomenda com múltiplos itens", () => {
    const items: OrderItem[] = [
      { quantity: 2, unit_price: 10 },
      { quantity: 3, unit_price: 5 },
    ];
    expect(calculateOrderTotal(items)).toBe(35);
  });

  it("deve aplicar desconto por item", () => {
    const items: OrderItem[] = [
      { quantity: 1, unit_price: 100, discount_percent: 10 },
    ];
    expect(calculateOrderTotal(items)).toBe(90);
  });

  it("deve aplicar desconto global após somar itens", () => {
    const items: OrderItem[] = [
      { quantity: 2, unit_price: 10 },
      { quantity: 2, unit_price: 10 },
    ];
    expect(calculateOrderTotal(items, 10)).toBe(36);
  });

  it("deve aplicar desconto por item e desconto global", () => {
    const items: OrderItem[] = [
      { quantity: 1, unit_price: 100, discount_percent: 10 }, // 90
      { quantity: 1, unit_price: 100, discount_percent: 20 }, // 80
    ];
    // Subtotal: 170, desconto global 10%: 153
    expect(calculateOrderTotal(items, 10)).toBe(153);
  });
});
