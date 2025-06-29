"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../utils/firebaseConfig";
import { PassiveBloom, PassiveBloomRow } from "../utils/PassiveBloom";
import Link from "next/link";
// import { DividendWithSymbol, fetchTotalDividendAmount } from "../utils/DividendData";
import { fetchUtilityExpenses, UtilityExpense, fetchTotalUtilityExpensesAmount } from "../utils/UtilityExpenses";
import { UtilityPivot } from "../utils/UtilityPivot";
import { fetchDividendIncome, DividendIncome, DividendIncomePivot, fetchTotalDividendIncomeAmount } from "../utils/DividendIncome";
import { DividendCoverageChart } from "./components/DividendCoverageChart";

export default function Home() {

  // PassiveBloom state and fetch
  const [passiveBloomRows, setPassiveBloomRows] = useState<PassiveBloomRow[]>([]);
  const [pbError, setPbError] = useState<string | null>(null);

  // const [totalDividendAmount, setTotalDividendAmount] = useState<number>(0);
  const [totalUtilityExpensesAmount, setTotalUtilityExpensesAmount] = useState<number>(0);
  const [totalDividendIncomeAmount, setTotalDividendIncomeAmount] = useState<number>(0);

  useEffect(() => {
    fetchTotalDividendIncomeAmount().then(setTotalDividendIncomeAmount);
    fetchTotalUtilityExpensesAmount().then(setTotalUtilityExpensesAmount);
  }, []);

  useEffect(() => {
    PassiveBloom.getAll()
      .then(setPassiveBloomRows)
      .catch((err) => setPbError(err.message));
  }, []);

  // Supabase dividends with symbol state
  // const [dividends] = useState<DividendWithSymbol[]>([]);
  



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
  // dividends.forEach((div) => {
  //   const symbol = div.stock_symbol;
  //   if (!pivotData[symbol]) pivotData[symbol] = {};
  //   pivotData[symbol][div.month] = Number(div.amount);
  // });

  // --- Pivot dividend income data for month-wise table ---
  const dividendIncomeMonthsOrder = DividendIncomePivot.monthsOrder;
  const dividendIncomeCategories = DividendIncomePivot.getCategories(dividendIncome);
  const dividendIncomePivotData = DividendIncomePivot.getPivotData(dividendIncome);
  const dividendIncomeMonthTotals = DividendIncomePivot.getMonthTotals(dividendIncomePivotData, dividendIncomeCategories);

  const [loading, setLoading] = useState(true);
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

  const [dividendCardMinimized, setDividendCardMinimized] = useState(false);
  const [utilityCardMinimized, setUtilityCardMinimized] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to /login
  }

  // Calculate percentage covered and down (using dividend_income)
  const percentCovered = totalUtilityExpensesAmount > 0
    ? Math.min((totalDividendIncomeAmount / totalUtilityExpensesAmount) * 100, 100)
    : 0;
  const percentDown = 100 - percentCovered;

  // Prepare monthlyData for the donut/timeline chart
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthlyData = months.map((month) => {
    const dividend = dividendIncome.reduce((sum, row) => {
      const date = new Date(row.create_date);
      const m = date.toLocaleString("en-US", { month: "long" });
      return m === month ? sum + row.amount : sum;
    }, 0);
    const utility = utilityExpenses.reduce((sum, row) => {
      const date = new Date(row.create_date);
      const m = date.toLocaleString("en-US", { month: "long" });
      return m === month ? sum + row.amount : sum;
    }, 0);
    return { month, dividend, utility };
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Logout link at top right */}
      <div className="w-full flex justify-end absolute top-4 right-8 z-10">
        <Link href="/logout" className="text-green-700 underline hover:text-green-900 font-semibold">
          Logout
        </Link>
      </div>
      <main className="flex flex-col gap-[64px] row-start-3 items-center sm:items-start">
        <div>
          <div className="flex flex-row items-center gap-10 my-4">
            {/* <div>
              <div className="text-lg font-bold">
                Total Dividend Income Amount: {totalDividendIncomeAmount.toFixed(2)}
              </div>
              <div className="text-lg font-bold">
                Total Utility Expenses Amount: {totalUtilityExpensesAmount.toFixed(2)}
              </div>
            </div> */}
            <div className="ml-16">
              <DividendCoverageChart percentCovered={percentCovered} percentDown={percentDown} monthlyData={monthlyData} />
            </div>
          </div>
        </div>


        {/* Utility Expenses Modern Card with Minimize/Maximize */}
        <div className="w-full flex justify-center mt-8">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-5xl border border-gray-800 relative">
            {/* Minimize/Maximize Button */}
            <button
              onClick={() => setUtilityCardMinimized((prev) => !prev)}
              className="absolute top-4 right-4 p-2 rounded hover:bg-gray-800 transition"
              aria-label={utilityCardMinimized ? "Maximize" : "Minimize"}
            >
              {utilityCardMinimized ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
              )}
            </button>
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-100 text-cyan-600 rounded-full p-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15.93V18a1 1 0 11-2 0v-1.07A8.001 8.001 0 014.07 13H6a1 1 0 110 2H4.07A8.001 8.001 0 0111 4.07V6a1 1 0 112 0V4.07A8.001 8.001 0 0119.93 11H18a1 1 0 110-2h1.93A8.001 8.001 0 0113 19.93z"></path></svg></span>
                <span className="text-white text-xl font-semibold">Utility Expenses</span>
              </div>
              <span className="ml-4 text-gray-300 text-base">Total: <span className="font-semibold">${totalUtilityExpensesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
            {/* Category List (hide if minimized) */}
            {!utilityCardMinimized && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-col gap-1">
                  {utilityCategories.map((category) => (
                    <div key={category} className="flex justify-between w-56">
                      <span className="text-gray-100 font-medium">{category}</span>
                      <span className="text-cyan-400 font-semibold">${utilityPivotData[category] ? Object.values(utilityPivotData[category]).reduce((sum, v) => sum + (v || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Divider (hide if minimized) */}
            {!utilityCardMinimized && <hr className="my-4 border-gray-700" />}
            {/* Table always visible */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="text-left p-3 font-medium">Category</th>
                    {utilityMonthsOrder.map((month) => (
                      <th key={month} className="text-center p-3 font-medium">{month.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utilityCategories.map((category) => (
                    <tr key={category} className="border-b border-gray-800">
                      <td className="p-3 font-medium text-gray-100">{category}</td>
                      {utilityMonthsOrder.map((month) => (
                        <td key={month} className="p-3 text-center text-gray-200">
                          {utilityPivotData[category][month] && utilityPivotData[category][month] > 0
                            ? `$${utilityPivotData[category][month].toFixed(0)}`
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="font-bold">
                    <td className="p-3 font-medium text-gray-100">Total</td>
                    {utilityMonthsOrder.map((month) => (
                      <td key={month} className="p-3 text-center text-gray-200">
                        {utilityMonthTotals[month] && utilityMonthTotals[month] > 0
                          ? `$${utilityMonthTotals[month].toFixed(0)}`
                          : "-"}
                      </td>
                    ))}
                  </tr>
                  {utilityCategories.length === 0 && (
                    <tr>
                      <td colSpan={utilityMonthsOrder.length + 1} className="text-center py-4 text-gray-400">
                        No utility expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dividend Income Modern Card with Minimize/Maximize */}
        <div className="w-full flex justify-center mt-8">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-5xl border border-gray-800 relative">
            {/* Minimize/Maximize Button */}
            <button
              onClick={() => setDividendCardMinimized((prev) => !prev)}
              className="absolute top-4 right-4 p-2 rounded hover:bg-gray-800 transition"
              aria-label={dividendCardMinimized ? "Maximize" : "Minimize"}
            >
              {dividendCardMinimized ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
              )}
            </button>
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-600 rounded-full p-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15.93V18a1 1 0 11-2 0v-1.07A8.001 8.001 0 014.07 13H6a1 1 0 110 2H4.07A8.001 8.001 0 0111 4.07V6a1 1 0 112 0V4.07A8.001 8.001 0 0119.93 11H18a1 1 0 110-2h1.93A8.001 8.001 0 0113 19.93z"></path></svg></span>
                <span className="text-white text-xl font-semibold">Dividend Income</span>
              </div>
              <span className="ml-4 text-gray-300 text-base">Total: <span className="font-semibold">${totalDividendIncomeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
            {/* Category List (hide if minimized) */}
            {!dividendCardMinimized && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-col gap-1">
                  {dividendIncomeCategories.map((category) => (
                    <div key={category} className="flex justify-between w-56">
                      <span className="text-gray-100 font-medium">{category}</span>
                      <span className="text-green-400 font-semibold">${dividendIncomePivotData[category] ? Object.values(dividendIncomePivotData[category]).reduce((sum, v) => sum + (v || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Divider (hide if minimized) */}
            {!dividendCardMinimized && <hr className="my-4 border-gray-700" />}
            {/* Table always visible */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="text-left p-3 font-medium">Category</th>
                    {dividendIncomeMonthsOrder.map((month) => (
                      <th key={month} className="text-center p-3 font-medium">{month.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dividendIncomeCategories.map((category) => (
                    <tr key={category} className="border-b border-gray-800">
                      <td className="p-3 font-medium text-gray-100">{category}</td>
                      {dividendIncomeMonthsOrder.map((month) => (
                        <td key={month} className="p-3 text-center text-gray-200">
                          {dividendIncomePivotData[category][month] && dividendIncomePivotData[category][month] > 0
                            ? `$${dividendIncomePivotData[category][month].toFixed(0)}`
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
