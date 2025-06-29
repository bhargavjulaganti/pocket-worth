import React from "react";

interface DividendTableProps {
  minimized: boolean;
  onToggle: () => void;
  total: number;
  categories: string[];
  monthsOrder: string[];
  pivotData: Record<string, Record<string, number>>;
}

const DividendTable: React.FC<DividendTableProps> = ({ minimized, onToggle, total, categories, monthsOrder, pivotData }) => (
  <div className="bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-5xl border border-gray-800 relative">
    {/* Minimize/Maximize Button */}
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 p-2 rounded hover:bg-gray-800 transition"
      aria-label={minimized ? "Maximize" : "Minimize"}
    >
      {minimized ? (
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
      <span className="ml-4 text-gray-300 text-base">Total: <span className="font-semibold">${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
    </div>
    {/* Category List (hide if minimized) */}
    {!minimized && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-1">
          {categories.map((category) => (
            <div key={category} className="flex justify-between w-56">
              <span className="text-gray-100 font-medium">{category}</span>
              <span className="text-green-400 font-semibold">${pivotData[category] ? Object.values(pivotData[category]).reduce((sum, v) => sum + (v || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    {/* Divider (hide if minimized) */}
    {!minimized && <hr className="my-4 border-gray-700" />}
    {/* Table always visible */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-gray-300">
            <th className="text-left p-3 font-medium">Category</th>
            {monthsOrder.map((month) => (
              <th key={month} className="text-center p-3 font-medium">{month.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category} className="border-b border-gray-800">
              <td className="p-3 font-medium text-gray-100">{category}</td>
              {monthsOrder.map((month) => (
                <td key={month} className="p-3 text-center text-gray-200">
                  {pivotData[category][month] && pivotData[category][month] > 0
                    ? `$${pivotData[category][month].toFixed(0)}`
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DividendTable;
