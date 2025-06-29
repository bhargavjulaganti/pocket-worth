// import { supabase } from './supabaseClient';

// export type Dividend = {
//   id: number;
//   stock_id: number;
//   month: string;
//   year: number;
//   amount: number;
// };

// export type DividendWithSymbol = {
//   id: number;
//   stock_id: number;
//   stock_symbol: string;
//   month: string;
//   year: number;
//   amount: number;
// };

// export async function fetchDividends(): Promise<Dividend[]> {
//   const { data, error } = await supabase
//     .from('dividends')
//     .select('*')
//     .order('year', { ascending: false })
//     .order('month', { ascending: false });

//   if (error) {
//     console.error('Error fetching dividends:', error);
//     return [];
//   }
//   return data as Dividend[];
// }

// export async function fetchAllDividends(): Promise<Dividend[]> {
//   const { data, error } = await supabase
//     .from('dividends')
//     .select('*');

//   if (error) {
//     console.error('Error fetching all dividends:', error);
//     return [];
//   }
//   return data as Dividend[];
// }

// export async function fetchDividendsWithSymbol(): Promise<DividendWithSymbol[]> {
//   const { data, error } = await supabase
//     .from('dividends')
//     .select('id, stock_id, month, year, amount, stocks(symbol)')
//     .order('stock_id', { ascending: true })
//     .order('year', { ascending: true })
//     .order('month', { ascending: true });

//   if (error) {
//     console.error('Error fetching dividends with symbol:', error);
//     return [];
//   }
//   // Map stock symbol from joined stocks table
//   return (data ?? []).map((row: any) => ({
//     id: row.id,
//     stock_id: row.stock_id,
//     stock_symbol: row.stocks?.symbol ?? "",
//     month: row.month,
//     year: row.year,
//     amount: Number(row.amount),
//   }));
// }

// export async function fetchTotalDividendAmount(): Promise<number> {
//   const { data, error } = await supabase
//     .from('dividends')
//     .select('amount');

//   if (error) {
//     console.error('Error fetching total dividend amount:', error);
//     return 0;
//   }
//   return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
// }