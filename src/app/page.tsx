"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../utils/firebaseConfig";
import { PassiveBloom, PassiveBloomRow } from "../utils/PassiveBloom";
import Link from "next/link";
import { DividendWithSymbol, fetchTotalDividendAmount } from "../utils/DividendData";
import { fetchUtilityExpenses, UtilityExpense, fetchTotalUtilityExpensesAmount } from "../utils/UtilityExpenses";
import { UtilityPivot } from "../utils/UtilityPivot";
import { fetchDividendIncome, DividendIncome, DividendIncomePivot } from "../utils/DividendIncome";

export default function Home() {

  // PassiveBloom state and fetch
  const [passiveBloomRows, setPassiveBloomRows] = useState<PassiveBloomRow[]>([]);
  const [pbError, setPbError] = useState<string | null>(null);

  const [totalDividendAmount, setTotalDividendAmount] = useState<number>(0);
  const [totalUtilityExpensesAmount, setTotalUtilityExpensesAmount] = useState<number>(0);

  useEffect(() => {
    fetchTotalDividendAmount().then(setTotalDividendAmount);
    fetchTotalUtilityExpensesAmount().then(setTotalUtilityExpensesAmount);
  }, []);

  useEffect(() => {
    PassiveBloom.getAll()
      .then(setPassiveBloomRows)
      .catch((err) => setPbError(err.message));
  }, []);

  // Supabase dividends with symbol state
  const [dividends] = useState<DividendWithSymbol[]>([]);
  



  // Utility expenses state
  const [utilityExpenses, setUtilityExpenses] = useState<UtilityExpense[]>([]);
  const [utilityExpensesLoading, setUtilityExpensesLoading] = useState(true);
  const [utilityExpensesError, setUtilityExpensesError] = useState<string | null>(null);

  useEffect(() => {
    fetchUtilityExpenses()
      .then((data) => {
        setUtilityExpenses(data);
        setUtilityExpensesLoading(false);
      })
      .catch((err) => {
        setUtilityExpensesError(err.message);
        setUtilityExpensesLoading(false);
      });
  }, []);

  // Dividend income state
  const [dividendIncome, setDividendIncome] = useState<DividendIncome[]>([]);
  const [dividendIncomeLoading, setDividendIncomeLoading] = useState(true);
  const [dividendIncomeError, setDividendIncomeError] = useState<string | null>(null);

  useEffect(() => {
    fetchDividendIncome()
      .then((data) => {
        setDividendIncome(data);
        setDividendIncomeLoading(false);
      })
      .catch((err) => {
        setDividendIncomeError(err.message);
        setDividendIncomeLoading(false);
      });
  }, []);

  // --- Pivot utility expenses data for month-wise table ---
  const utilityMonthsOrder = UtilityPivot.monthsOrder;
  const utilityCategories = UtilityPivot.getCategories(utilityExpenses);
  const utilityPivotData = UtilityPivot.getPivotData(utilityExpenses);
  const utilityMonthTotals = UtilityPivot.getMonthTotals(utilityPivotData, utilityCategories);




  // Build pivot data: { [symbol]: { [month]: amount } }
  const pivotData: Record<string, Record<string, number>> = {};
  dividends.forEach((div) => {
    const symbol = div.stock_symbol;
    if (!pivotData[symbol]) pivotData[symbol] = {};
    pivotData[symbol][div.month] = Number(div.amount);
  });

  // --- Pivot dividend income data for month-wise table ---
  const dividendIncomeMonthsOrder = DividendIncomePivot.monthsOrder;
  const dividendIncomeCategories = DividendIncomePivot.getCategories(dividendIncome);
  const dividendIncomePivotData = DividendIncomePivot.getPivotData(dividendIncome);
  const dividendIncomeMonthTotals = DividendIncomePivot.getMonthTotals(dividendIncomePivotData, dividendIncomeCategories);

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to /login
  }

  // Calculate percentage covered and down
  const percentCovered = totalUtilityExpensesAmount > 0
    ? Math.min((totalDividendAmount / totalUtilityExpensesAmount) * 100, 100)
    : 0;
  const percentDown = 100 - percentCovered;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Logout link at top right */}
      <div className="w-full flex justify-end absolute top-4 right-8 z-10">
        <Link href="/logout" className="text-green-700 underline hover:text-green-900 font-semibold">
          Logout
        </Link>
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          {/* ...other components... */}
          <div className="my-4 text-lg font-bold">
            Total Dividend Amount: {totalDividendAmount.toFixed(2)}
          </div>
          <div className="my-4 text-lg font-bold">
            Total Utility Expenses Amount: {totalUtilityExpensesAmount.toFixed(2)}
          </div>
          {/* Percentage bar visualization */}
          <div className="w-full max-w-md my-4">
            <div className="mb-1 text-sm text-gray-700 font-semibold">Dividend Coverage</div>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${percentCovered}%` }}
              ></div>
              <div
                className="absolute right-0 top-0 h-full bg-red-400 rounded-full transition-all duration-500"
                style={{ width: `${percentDown}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                {percentCovered.toFixed(1)}% covered, {percentDown.toFixed(1)}% down
              </div>
            </div>
          </div>
          {/* Donut chart visualization */}
          <div className="w-full max-w-xs my-4 flex flex-col items-center">
            <div className="mb-1 text-sm text-gray-700 font-semibold">Dividend Coverage (Donut)</div>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="18"
              />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="#22c55e"
                strokeWidth="18"
                strokeDasharray={`${Math.PI * 100} ${(1 - percentCovered / 100) * Math.PI * 100}`}
                strokeDashoffset={Math.PI * 50}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s' }}
              />
              <text
                x="60" y="66"
                textAnchor="middle"
                fontSize="1.5rem"
                fontWeight="bold"
                fill="#222"
              >
                {percentCovered.toFixed(0)}%
              </text>
            </svg>
            <div className="text-xs text-gray-600 mt-1">of utility expenses covered by dividends</div>
          </div>
          {/* ...other components... */}
        </div>


        {/* Utility Expenses by Month - move to top */}
        <div className="w-full flex justify-center">
          <div>
            <h2 className="text-xl font-semibold mb-4">Utility Expenses by Month</h2>
            {utilityExpensesLoading ? (
              <div>Loading utility expenses...</div>
            ) : utilityExpensesError ? (
              <div className="text-red-600">{utilityExpensesError}</div>
            ) : (
              <table className="border-collapse border">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="border border-gray-400 px-4 py-2">Name</th>
                    {utilityMonthsOrder.map((month) => (
                      <th key={month} className="border border-gray-400 px-4 py-2">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utilityCategories.map((category) => (
                    <tr key={category}>
                      <td className="border border-gray-400 px-4 py-2 font-semibold">{category}</td>
                      {utilityMonthsOrder.map((month) => (
                        <td key={month} className="border border-gray-400 px-4 py-2">
                          {utilityPivotData[category][month] !== undefined
                            ? utilityPivotData[category][month].toFixed(2)
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="font-bold" >
                    <td className="border border-gray-400 px-4 py-2">Total</td>
                    {utilityMonthsOrder.map((month) => (
                      <td key={month} className="border border-gray-400 px-4 py-2">
                        {utilityMonthTotals[month] ? utilityMonthTotals[month].toFixed(2) : ""}
                      </td>
                    ))}
                  </tr>
                  {utilityCategories.length === 0 && (
                    <tr>
                      <td colSpan={utilityMonthsOrder.length + 1} className="text-center py-4">
                        No utility expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pivoted Dividend Income Table */}
        <div className="w-full flex justify-center mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Dividend Income by Month</h2>
            {dividendIncomeLoading ? (
              <div>Loading dividend income...</div>
            ) : dividendIncomeError ? (
              <div className="text-red-600">{dividendIncomeError}</div>
            ) : (
              <table className="border-collapse border">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="border border-gray-400 px-4 py-2">Name</th>
                    {dividendIncomeMonthsOrder.map((month) => (
                      <th key={month} className="border border-gray-400 px-4 py-2">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dividendIncomeCategories.map((category) => (
                    <tr key={category}>
                      <td className="border border-gray-400 px-4 py-2 font-semibold">{category}</td>
                      {dividendIncomeMonthsOrder.map((month) => (
                        <td key={month} className="border border-gray-400 px-4 py-2">
                          {dividendIncomePivotData[category][month] !== undefined
                            ? dividendIncomePivotData[category][month].toFixed(2)
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="font-bold">
                    <td className="border border-gray-400 px-4 py-2">Total</td>
                    {dividendIncomeMonthsOrder.map((month) => (
                      <td key={month} className="border border-gray-400 px-4 py-2">
                        {dividendIncomeMonthTotals[month] ? dividendIncomeMonthTotals[month].toFixed(2) : ""}
                      </td>
                    ))}
                  </tr>
                  {dividendIncomeCategories.length === 0 && (
                    <tr>
                      <td colSpan={dividendIncomeMonthsOrder.length + 1} className="text-center py-4">
                        No dividend income found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>



        {/* PassiveBloom Table - move to bottom */}
        <div className="w-full flex justify-center mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">PassiveBloom Data</h2>
            {pbError && <div className="text-red-600 mb-2">{pbError}</div>}
            <table className="border-collapse border">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="border border-gray-400 px-4 py-2">ID</th>
                  <th className="border border-gray-400 px-4 py-2">Created At</th>
                  <th className="border border-gray-400 px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {passiveBloomRows.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-gray-400 px-4 py-2">{row.id}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      {row.created_at ? row.created_at.slice(0, 10) : ""}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">{row.amount}</td>
                  </tr>
                ))}
                {passiveBloomRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      {/* Remove the logout link from the footer */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* (No logout link here) */}
      </footer>
    </div>
  );
}
