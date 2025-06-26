"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../utils/firebaseConfig";
import { utilitiesData2025 } from "./UtilitesData";
import { PassiveBloom, PassiveBloomRow } from "../utils/PassiveBloom";
import Link from "next/link";
import { fetchDividendsWithSymbol, DividendWithSymbol } from "../utils/DividendData";

export default function Home() {
  const utilitiesHeaders = utilitiesData2025.length > 0 ? Object.keys(utilitiesData2025[0]) : [];
  const utilitiesTotals: Record<string, number | string> = {};
  utilitiesHeaders.forEach((header) => {
    if (header === "Name") {
      utilitiesTotals[header] = "Total";
    } else {
      const sum = utilitiesData2025.reduce(
        (sum, row) =>
          typeof row[header as keyof typeof row] === "number"
            ? sum + (row[header as keyof typeof row] as number)
            : sum,
        0
      );
      utilitiesTotals[header] = sum ? sum.toFixed(2) : "";
    }
  });

  // PassiveBloom state and fetch
  const [passiveBloomRows, setPassiveBloomRows] = useState<PassiveBloomRow[]>([]);
  const [pbError, setPbError] = useState<string | null>(null);

  useEffect(() => {
    PassiveBloom.getAll()
      .then(setPassiveBloomRows)
      .catch((err) => setPbError(err.message));
  }, []);

  // Supabase dividends with symbol state
  const [dividends, setDividends] = useState<DividendWithSymbol[]>([]);
  const [dividendsLoading, setDividendsLoading] = useState(true);
  const [dividendsError, setDividendsError] = useState<string | null>(null);

  useEffect(() => {
    fetchDividendsWithSymbol()
      .then((data) => {
        setDividends(data);
        setDividendsLoading(false);
      })
      .catch((err) => {
        setDividendsError(err.message);
        setDividendsLoading(false);
      });
  }, []);

  // --- Pivot dividends data for month-wise table ---
  const monthsOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get unique stock symbols in the order they appear
  const stockSymbols = Array.from(
    new Set(dividends.map((d) => d.stock_symbol))
  );

  // Build pivot data: { [symbol]: { [month]: amount } }
  const pivotData: Record<string, Record<string, number>> = {};
  dividends.forEach((div) => {
    const symbol = div.stock_symbol;
    if (!pivotData[symbol]) pivotData[symbol] = {};
    pivotData[symbol][div.month] = Number(div.amount);
  });

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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Logout link at top right */}
      <div className="w-full flex justify-end absolute top-4 right-8 z-10">
        <Link href="/logout" className="text-green-700 underline hover:text-green-900 font-semibold">
          Logout
        </Link>
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Pivoted Dividends Table */}
        <div className="w-full flex justify-center">
          <div>
            <h2 className="text-xl font-semibold mb-4">Dividends by Month</h2>
            {dividendsLoading ? (
              <div>Loading dividends...</div>
            ) : dividendsError ? (
              <div className="text-red-600">{dividendsError}</div>
            ) : (
              <table className="border-collapse border">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="border border-gray-400 px-4 py-2">Stock</th>
                    {monthsOrder.map((month) => (
                      <th key={month} className="border border-gray-400 px-4 py-2">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockSymbols.map((symbol) => (
                    <tr key={symbol}>
                      <td className="border border-gray-400 px-4 py-2 font-semibold">{symbol}</td>
                      {monthsOrder.map((month) => (
                        <td key={month} className="border border-gray-400 px-4 py-2">
                          {pivotData[symbol][month] !== undefined ? pivotData[symbol][month].toFixed(2) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {stockSymbols.length === 0 && (
                    <tr>
                      <td colSpan={monthsOrder.length + 1} className="text-center py-4">
                        No dividend data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Utilities Table below */}
        <div className="w-full flex justify-center mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Utilities</h2>
            <table className="border-collapse border">
              <thead>
                <tr className="bg-green-600 text-white">
                  {utilitiesHeaders.map((header) => (
                    <th key={header} className="border border-gray-400 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilitiesData2025.map((row) => (
                  <tr key={row.Name}>
                    {utilitiesHeaders.map((header) => (
                      <td key={header} className="border border-gray-400 px-4 py-2">
                        {row[header as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  {utilitiesHeaders.map((header) => (
                    <td key={header} className="border px-4 py-2">
                      {utilitiesTotals[header]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PassiveBloom Table */}
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
