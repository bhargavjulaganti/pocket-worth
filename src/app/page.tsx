"use client";
import { useEffect, useState, useRef } from "react";
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
import DividendTable from "./components/DividendTable";
import UtilityTable from "./components/UtilityTable";
import PassiveBloomTable from "./components/PassiveBloomTable";
import LogoutPopup from "./components/LogoutPopup";

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

  const [dividendCardMinimized, setDividendCardMinimized] = useState(true);
  const [utilityCardMinimized, setUtilityCardMinimized] = useState(true);

  // Inactivity logout state and refs
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes
  const POPUP_DURATION = 30; // seconds

  // Logout function
  const handleLogout = () => {
    window.location.href = "/logout";
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowLogoutPopup(false);
    // Set timer for inactivity
    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogoutPopup(true);
      setSecondsLeft(POPUP_DURATION);
      // Start countdown for popup (auto logout after 30s if no action)
      countdownIntervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleLogout(); // Auto logout if no action
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_LIMIT - POPUP_DURATION * 1000);
  };

  // Listen for user activity
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    const activityHandler = resetInactivityTimer;
    events.forEach((event) => window.addEventListener(event, activityHandler));
    resetInactivityTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, activityHandler));
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Stay logged in handler
  const handleStayLoggedIn = () => {
    setShowLogoutPopup(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    resetInactivityTimer();
  };

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
      {/* Logout Popup */}
      <LogoutPopup open={showLogoutPopup} onStay={handleStayLoggedIn} onLogout={handleLogout} secondsLeft={secondsLeft} />
      {/* Logout link at top right */}
      <div className="w-full flex justify-end absolute top-4 right-8 z-10">
        <Link href="/logout" className="text-green-700 underline hover:text-green-900 font-semibold">
          Logout
        </Link>
      </div>
      <main className="flex flex-col gap-[64px] row-start-3 items-center sm:items-start">
        <div>
          <div className="flex flex-row items-center gap-10 my-4">
            <div className="ml-16">
              <DividendCoverageChart percentCovered={percentCovered} percentDown={percentDown} monthlyData={monthlyData} />
            </div>
          </div>
        </div>


        {/* Utility Expenses Modern Card with Minimize/Maximize */}
        {/* Dividend and Utility Tables Side by Side */}
        <div className="w-full flex flex-col lg:flex-row gap-8 justify-center mt-8">
          <UtilityTable
            minimized={utilityCardMinimized}
            onToggle={() => setUtilityCardMinimized((prev) => !prev)}
            total={totalUtilityExpensesAmount}
            categories={utilityCategories}
            monthsOrder={utilityMonthsOrder}
            pivotData={utilityPivotData}
            monthTotals={utilityMonthTotals}
          />
          <DividendTable
            minimized={dividendCardMinimized}
            onToggle={() => setDividendCardMinimized((prev) => !prev)}
            total={totalDividendIncomeAmount}
            categories={dividendIncomeCategories}
            monthsOrder={dividendIncomeMonthsOrder}
            pivotData={dividendIncomePivotData}
          />
        </div>

        {/* PassiveBloom Table - move to bottom */}
        <PassiveBloomTable rows={passiveBloomRows} error={pbError} />

      </main>
      {/* Remove the logout link from the footer */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* (No logout link here) */}
      </footer>
    </div>
  );
}
