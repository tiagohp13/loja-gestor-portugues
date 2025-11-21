import { describe, it, expect } from 'vitest';
import { generateKPIs } from '@/pages/suporte/hooks/utils/kpiUtils';
import { SupportStats } from '@/pages/suporte/hooks/useSupportData';

describe('KPI Utils - generateKPIs', () => {
  const createMockStats = (overrides?: Partial<SupportStats>): SupportStats => ({
    totalSales: 10000,
    totalSpent: 6000,
    profit: 4000,
    profitMargin: 40,
    completedOrders: 50,
    pendingOrders: 5,
    clientsCount: 20,
    productsCount: 100,
    suppliersCount: 10,
    categoriesCount: 5,
    numberOfExpenses: 10,
    topProducts: [],
    lowStockProducts: [],
    monthlySales: [],
    monthlyData: [],
    monthlyOrders: [
      { name: 'Jan', orders: 12, completedExits: 10 }
    ],
    topSuppliers: [
      { name: 'Supplier 1', entries: 15 }
    ],
    topClients: [
      { name: 'Client 1', spending: 5000, orders: 10 }
    ],
    ...overrides
  });

  it('deve gerar KPIs com valores válidos', () => {
    const stats = createMockStats();
    const kpis = generateKPIs(stats);

    expect(kpis).toHaveLength(8);
    expect(kpis[0].name).toBe('ROI');
    expect(kpis[0].value).toBeGreaterThan(0);
    expect(typeof kpis[0].value).toBe('number');
  });

  it('deve lidar com valores null sem erro', () => {
    const stats = createMockStats({
      totalSales: 0,
      totalSpent: 0,
      profit: 0,
      profitMargin: 0
    });

    expect(() => generateKPIs(stats)).not.toThrow();
    const kpis = generateKPIs(stats);
    expect(kpis[0].value).toBe(0); // ROI deve ser 0
  });

  it('deve lidar com divisão por zero', () => {
    const stats = createMockStats({
      completedOrders: 0,
      clientsCount: 0,
      totalSpent: 0
    });

    expect(() => generateKPIs(stats)).not.toThrow();
    const kpis = generateKPIs(stats);
    
    // Verificar que não há NaN ou Infinity
    kpis.forEach(kpi => {
      expect(isNaN(kpi.value)).toBe(false);
      expect(isFinite(kpi.value)).toBe(true);
    });
  });

  it('deve calcular ROI corretamente', () => {
    const stats = createMockStats({
      profit: 4000,
      totalSpent: 6000
    });

    const kpis = generateKPIs(stats);
    const roiKpi = kpis.find(k => k.name === 'ROI');
    
    expect(roiKpi).toBeDefined();
    expect(roiKpi!.value).toBeCloseTo(66.67, 1); // (4000/6000) * 100 = 66.67%
  });

  it('deve calcular Margem de Lucro corretamente', () => {
    const stats = createMockStats({
      profitMargin: 35.5
    });

    const kpis = generateKPIs(stats);
    const marginKpi = kpis.find(k => k.name === 'Margem de Lucro');
    
    expect(marginKpi).toBeDefined();
    expect(marginKpi!.value).toBe(35.5);
  });

  it('deve calcular Taxa de Conversão corretamente', () => {
    const stats = createMockStats({
      completedOrders: 50,
      clientsCount: 200
    });

    const kpis = generateKPIs(stats);
    const conversionKpi = kpis.find(k => k.name === 'Taxa de Conversão');
    
    expect(conversionKpi).toBeDefined();
    expect(conversionKpi!.value).toBe(25); // (50/200) * 100 = 25%
  });

  it('deve calcular Valor Médio de Compra incluindo despesas', () => {
    const stats = createMockStats({
      totalSpent: 8000,
      numberOfExpenses: 10,
      topSuppliers: [
        { name: 'Supplier 1', entries: 20 }
      ]
    });

    const kpis = generateKPIs(stats);
    const avgPurchaseKpi = kpis.find(k => k.name === 'Valor Médio de Compra');
    
    expect(avgPurchaseKpi).toBeDefined();
    // (8000 / (20 entries + 10 expenses)) = 266.67
    expect(avgPurchaseKpi!.value).toBeCloseTo(266.67, 1);
  });

  it('deve calcular Valor Médio de Venda corretamente', () => {
    const stats = createMockStats({
      totalSales: 15000,
      completedOrders: 50
    });

    const kpis = generateKPIs(stats);
    const avgSaleKpi = kpis.find(k => k.name === 'Valor Médio de Venda');
    
    expect(avgSaleKpi).toBeDefined();
    expect(avgSaleKpi!.value).toBe(300); // 15000/50 = 300
  });

  it('deve calcular Lucro Médio por Venda corretamente', () => {
    const stats = createMockStats({
      profit: 5000,
      completedOrders: 25
    });

    const kpis = generateKPIs(stats);
    const avgProfitKpi = kpis.find(k => k.name === 'Lucro Médio por Venda');
    
    expect(avgProfitKpi).toBeDefined();
    expect(avgProfitKpi!.value).toBe(200); // 5000/25 = 200
  });

  it('deve calcular Lucro por Cliente corretamente', () => {
    const stats = createMockStats({
      profit: 8000,
      clientsCount: 40
    });

    const kpis = generateKPIs(stats);
    const profitPerClientKpi = kpis.find(k => k.name === 'Lucro por Cliente');
    
    expect(profitPerClientKpi).toBeDefined();
    expect(profitPerClientKpi!.value).toBe(200); // 8000/40 = 200
  });

  it('deve marcar KPIs abaixo da meta corretamente', () => {
    const stats = createMockStats({
      profit: 2000, // Abaixo da meta de 10000
      totalSpent: 6000
    });

    const kpis = generateKPIs(stats);
    const lucroTotalKpi = kpis.find(k => k.name === 'Lucro Total');
    
    expect(lucroTotalKpi).toBeDefined();
    expect(lucroTotalKpi!.belowTarget).toBe(true);
  });

  it('deve lidar com valores NaN e Infinity', () => {
    const stats = createMockStats({
      totalSales: NaN as any,
      totalSpent: Infinity as any,
      profit: -Infinity as any,
      profitMargin: NaN as any
    });

    expect(() => generateKPIs(stats)).not.toThrow();
    const kpis = generateKPIs(stats);
    
    // Todos os valores devem ser números finitos
    kpis.forEach(kpi => {
      expect(isNaN(kpi.value)).toBe(false);
      expect(isFinite(kpi.value)).toBe(true);
      expect(kpi.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('deve lidar com valores undefined', () => {
    const stats = createMockStats({
      totalSales: undefined as any,
      totalSpent: undefined as any,
      profit: undefined as any
    });

    expect(() => generateKPIs(stats)).not.toThrow();
    const kpis = generateKPIs(stats);
    
    kpis.forEach(kpi => {
      expect(typeof kpi.value).toBe('number');
      expect(isNaN(kpi.value)).toBe(false);
    });
  });

  it('deve ter todos os KPIs com propriedades obrigatórias', () => {
    const stats = createMockStats();
    const kpis = generateKPIs(stats);

    kpis.forEach(kpi => {
      expect(kpi).toHaveProperty('name');
      expect(kpi).toHaveProperty('value');
      expect(kpi).toHaveProperty('target');
      expect(kpi).toHaveProperty('unit');
      expect(kpi).toHaveProperty('description');
      expect(kpi).toHaveProperty('formula');
      expect(kpi).toHaveProperty('belowTarget');
      
      expect(typeof kpi.name).toBe('string');
      expect(typeof kpi.value).toBe('number');
      expect(typeof kpi.target).toBe('number');
      expect(typeof kpi.unit).toBe('string');
      expect(typeof kpi.description).toBe('string');
      expect(typeof kpi.formula).toBe('string');
      expect(typeof kpi.belowTarget).toBe('boolean');
    });
  });
});
