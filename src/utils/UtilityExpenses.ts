import { supabase } from './supabaseClient';

export type UtilityExpense = {
  id: number;
  category_name: string;
  create_date: string; // ISO date string
  amount: number;
};

export async function fetchUtilityExpenses(): Promise<UtilityExpense[]> {
  const { data, error } = await supabase
    .from('utility_expenses')
    .select('*')
    .order('create_date', { ascending: false });

  if (error) {
    console.error('Error fetching utility expenses:', error);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...row,
    // Ensure create_date is parsed as YYYY-MM-DD, not as UTC (which can cause month shift)
    create_date: typeof row.create_date === "string"
      ? row.create_date
      : (row.create_date?.toISOString?.().slice(0, 10) ?? ""),
    amount: Number(row.amount),
  }));
}

export async function fetchTotalUtilityExpensesAmount(): Promise<number> {
  const { data, error } = await supabase
    .from('utility_expenses')
    .select('amount');

  if (error) {
    console.error('Error fetching total utility expenses amount:', error);
    return 0;
  }
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}
