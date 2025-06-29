import React from "react";

interface PassiveBloomTableProps {
  rows: { id: string | number; name?: string; created_at?: string; amount: number }[];
  error?: string | null;
}

const PassiveBloomTable: React.FC<PassiveBloomTableProps> = ({ rows, error }) => {
  return (
    <div className="w-full flex justify-center mt-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-2 w-full max-w-md mx-auto border border-gray-100 dark:border-gray-800">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-xs uppercase">
              <th className="py-0.5 px-0.5 text-left font-semibold">Date Received</th>
              <th className="py-0.5 px-0.5 text-left font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-1 px-0.5 flex items-center gap-1 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path stroke="#10b981" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {row.created_at
                    ? new Date(row.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="py-1 px-0.5 whitespace-nowrap">
                  <span className="font-bold text-green-600 text-sm">${row.amount.toLocaleString()}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-1 text-gray-400">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PassiveBloomTable;
