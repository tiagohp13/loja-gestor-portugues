// ============================================
// 📅 dateUtils.ts
// ============================================
// Funções auxiliares de datas para intervalos de 30 dias e meses
// Usadas nos cálculos de KPIs e dashboards
// ============================================

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

// Últimos N dias consecutivos
export const rangeLastNDays = (n: number) => {
  const end = endOfDay(new Date());
  const start = startOfDay(daysAgo(n - 1));
  return { start, end };
};

// Intervalo anterior com a mesma duração (para comparar)
export const previousRangeSameLength = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime() + 1;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - (ms - 1));
  return { start: prevStart, end: prevEnd };
};

// Intervalo do mês atual
export const monthRange = (ref: Date) => {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Intervalo do mês anterior
export const previousMonthRange = (ref: Date) => {
  const start = new Date(ref.getFullYear(), ref.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), ref.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
};
