import React, { useState, useEffect, useRef } from "react";

interface MonthlyDatum {
  month: string;
  dividend: number;
  utility: number;
}

interface DividendCoverageChartProps {
  percentCovered: number;
  percentDown: number;
  monthlyData: MonthlyDatum[];
}

export function DividendCoverageChart({
  percentCovered,
  percentDown,
  monthlyData,
}: DividendCoverageChartProps) {
  // const [showTooltip, setShowTooltip] = useState(false);
  // Animated progress state
  const [animatedPercent, setAnimatedPercent] = useState(percentCovered);
  const requestRef = useRef<number | null>(null);
  const prevPercentRef = useRef(percentCovered);

  useEffect(() => {
    let start: number | null = null;
    const duration = 700; // ms
    const initial = prevPercentRef.current;
    const delta = percentCovered - initial;
    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedPercent(initial + delta * progress);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedPercent(percentCovered);
        prevPercentRef.current = percentCovered;
      }
    }
    if (initial !== percentCovered) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [percentCovered]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[300px]">
      {/* KPI Tiles */}
      <div className="w-full flex flex-row items-center justify-center gap-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Total Dividend */}
          {/* <button
            className="flex flex-col items-center bg-white rounded-lg shadow hover:shadow-md transition p-2 border border-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
            title="View Dividend History">
            <span className="text-2xl">💵</span>
            <span className="text-xs text-gray-500">Total Dividend</span>
            <span className="font-bold text-lg text-yellow-600">
              {monthlyData.reduce((sum, d) => sum + d.dividend, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </button> */}
          {/* Total Utility */}
          {/* <div
            className="flex flex-col items-center bg-white rounded-lg shadow hover:shadow-md transition p-2 border border-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            title="View Utility History">
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-gray-500">Total Utility</span>
            <span className="font-bold text-lg text-cyan-600">
              {monthlyData.reduce((sum, d) => sum + d.utility, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div> */}
        </div>
      </div>
      {/* Progress Thermometer (Horizontal, Glassmorphism) - Centered */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center min-w-[24rem] w-full max-w-3xl justify-center mx-auto">
          <div className="mb-1 text-sm text-gray-700 dark:text-gray-200 font-semibold text-center">
            Progress Thermometer
          </div>
          <div
            className="relative w-full max-w-3xl p-4 rounded-2xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700 flex flex-col items-center"
          >
            <div className="w-full flex items-center gap-2">
              {/* Progress Bar */}
              <div className="relative flex-1 h-5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-5 rounded-full transition-all duration-500 ${
                    animatedPercent >= 100
                      ? 'bg-green-500'
                      : animatedPercent >= 80
                      ? 'bg-yellow-400'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(animatedPercent, 100)}%`,
                  }}
                ></div>
              </div>
              {/* Pill-style Percentage Badge */}
              <div
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-white/30 dark:border-gray-700 transition-colors duration-300 ${
                  animatedPercent >= 100
                    ? 'bg-green-500 text-white'
                    : animatedPercent >= 80
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-blue-500 text-white'
                }`}
                title="Percent Covered"
              >
                {animatedPercent.toFixed(1)}%
              </div>
            </div>
            {/* Min/Max Labels */}
            <div className="flex justify-between w-full mt-1 px-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">0%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">100%</span>
            </div>
            {/* Caption for Remaining Amount */}
            <div className="mt-2 text-xs font-medium text-center">
              {percentDown > 0 ? (
                <span className="text-blue-600 dark:text-blue-300">
                  {`$${((percentDown / 100) * monthlyData.reduce((sum, d) => sum + d.utility, 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} left to reach your goal`}
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">Goal reached! 🎉</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}