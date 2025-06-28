import React from "react";

interface DividendCoverageChartProps {
  percentCovered: number;
  percentDown: number;
}

export const DividendCoverageChart: React.FC<DividendCoverageChartProps> = ({ percentCovered }) => {
  return (
    <>
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
    </>
  );
};
