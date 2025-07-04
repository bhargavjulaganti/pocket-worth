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
    <div className="flex flex-col items-center justify-center w-full min-h-[220px] px-2">
      <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
        <div className="mb-2 text-lg text-gray-700 dark:text-gray-200 font-semibold text-center">
          Progress Thermometer
        </div>
        <div style={{ paddingRight: "26rem" }} className="relative w-full p-4 rounded-2xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700 flex flex-col items-center mx-auto">
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 justify-center">
            {/* Progress Bar */}
            <div className="relative w-full sm:flex-1 h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-3 sm:mb-0">
              <div
                className={`absolute left-0 top-0 h-8 rounded-full transition-all duration-500 ${
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
              className={`ml-0 sm:ml-4 px-5 py-2 rounded-full text-base font-bold shadow-md border border-white/30 dark:border-gray-700 transition-colors duration-300 ${
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
          <div className="flex justify-between w-full mt-2 px-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">0%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">100%</span>
          </div>
          {/* Caption for Remaining Amount */}
          <div className="mt-4 text-sm font-medium text-center">
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
  );
}