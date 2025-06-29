import React from "react";

interface PassiveBloomTableProps {
  rows: { id: string | number; name?: string; created_at?: string; amount: number }[];
  error?: string | null;
}

const getProgress = (amount: number, max: number) => Math.min(1, amount / max);

const PassiveBloomTable: React.FC<PassiveBloomTableProps> = ({ rows, error }) => {
  // Find the max amount for progress bar scaling
  const maxAmount = rows.length ? Math.max(...rows.map(r => r.amount)) : 1;

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-5xl mx-auto border border-gray-100 dark:border-gray-800">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 text-xs uppercase">
              <th className="py-2 px-2 text-left">Date Received</th>
              <th className="py-2 px-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-4 px-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
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
                <td className="py-4 px-2">
                  <div className="flex flex-col min-w-[120px]">
                    <span className="font-bold text-green-600 text-lg">${row.amount.toLocaleString()}</span>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mt-1">
                      <div
                        className="h-2 rounded-full bg-green-400 transition-all"
                        // style={{
                        //   width: `${getProgress(row.amount, maxAmount) * 100}%`,
                        // }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
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
