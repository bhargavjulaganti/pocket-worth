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
  const [showTooltip, setShowTooltip] = useState(false);
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
    <div className="w-full max-w-2xl my-4 flex flex-col items-center">
      {/* KPI Tiles + Progress Thermometer Row */}
      <div className="w-full flex flex-row items-center justify-center gap-4 mb-4">
        {/* KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          {/* Total Dividend */}
          <button
            className="flex flex-col items-center bg-white rounded-lg shadow hover:shadow-md transition p-2 border border-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
            title="View Dividend History">
            <span className="text-2xl">💵</span>
            <span className="text-xs text-gray-500">Total Dividend</span>
            <span className="font-bold text-lg text-yellow-600">
              {monthlyData.reduce((sum, d) => sum + d.dividend, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </button>
          {/* Total Utility */}
          <div
            className="flex flex-col items-center bg-white rounded-lg shadow hover:shadow-md transition p-2 border border-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            title="View Utility History">
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-gray-500">Total Utility</span>
            <span className="font-bold text-lg text-cyan-600">
              {monthlyData.reduce((sum, d) => sum + d.utility, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        {/* Progress Thermometer (Horizontal) */}
        <div className="flex flex-col items-center min-w-[18rem]">
          <div className="mb-1 text-sm text-gray-700 font-semibold">
            Progress Thermometer
          </div>
          <div
            className="relative w-64 h-8 bg-gray-200 rounded-full flex items-center cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div
              className="absolute left-0 top-0 h-8 rounded-l-full bg-green-500"
              style={{
                width: `${animatedPercent}%`,
                minWidth: 16,
                transition: "width 0.2s linear",
              }}
            ></div>
            {showTooltip && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full border border-gray-300 rounded px-2 py-1 text-xs shadow-lg z-10 whitespace-nowrap">
                {percentCovered.toFixed(1)}% covered
                <br />
                {percentDown.toFixed(1)}% to goal
                <br />
                {percentDown > 0
                  ? `Need ${percentDown.toFixed(1)}% more to hit 100%`
                  : "Goal reached!"}
              </div>
            )}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex justify-center w-8">
              <span className="text-xs font-bold text-gray-700">0%</span>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex justify-center w-8">
              <span className="text-xs font-bold text-gray-700">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}