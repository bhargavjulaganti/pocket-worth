import { supabase } from './supabaseClient';

export type DividendIncome = {
  id: number;
  category_name: string;
  create_date: string; // ISO date string
  amount: number;
};

export async function fetchDividendIncome(): Promise<DividendIncome[]> {
  const { data, error } = await supabase
    .from('dividend_income')
    .select('*')
    .order('create_date', { ascending: false });

  if (error) {
    console.error('Error fetching dividend income:', error);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount),
    create_date: typeof row.create_date === "string"
      ? row.create_date
      : (row.create_date?.toISOString?.().slice(0, 10) ?? ""),
  }));
}

export async function fetchTotalDividendIncomeAmount(): Promise<number> {
  const { data, error } = await supabase
    .from('dividend_income')
    .select('amount');

  if (error) {
    console.error('Error fetching total dividend income amount:', error);
    return 0;
  }
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export class DividendIncomePivot {
  static monthsOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  static getCategories(incomes: DividendIncome[]): string[] {
    return Array.from(new Set(incomes.map((e) => e.category_name)));
  }

  static getPivotData(incomes: DividendIncome[]): Record<string, Record<string, number>> {
    const pivotData: Record<string, Record<string, number>> = {};
    incomes.forEach((inc) => {
      const category = inc.category_name;
      const [year, monthNum] = inc.create_date.split('-');
      const month = new Date(Number(year), Number(monthNum) - 1).toLocaleString("en-US", { month: "long" });
      if (!pivotData[category]) pivotData[category] = {};
      if (!pivotData[category][month]) pivotData[category][month] = 0;
      pivotData[category][month] += Number(inc.amount);
    });
    return pivotData;
  }

  static getMonthTotals(
    pivotData: Record<string, Record<string, number>>,
    categories: string[]
  ): Record<string, number> {
    const totals: Record<string, number> = {};
    this.monthsOrder.forEach((month) => {
      totals[month] = categories.reduce(
        (sum, category) => sum + (pivotData[category][month] || 0),
        0
      );
    });
    return totals;
  }
}
