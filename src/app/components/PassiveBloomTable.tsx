import React from "react";

interface PassiveBloomTableProps {
  rows: { id: string | number; name?: string; created_at?: string; amount: number }[];
  error?: string | null;
}

const PassiveBloomTable: React.FC<PassiveBloomTableProps> = ({ rows }) => {
  return (
    <div className="w-full flex justify-center mt-8">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-3xl border border-gray-800 relative">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-600 rounded-full p-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="#10b981" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </span>
            <span className="text-white text-xl font-semibold">Passive Bloom Income</span>
          </div>
          <span className="ml-4 text-gray-300 text-base">Total: <span className="font-semibold">${rows.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
        </div>
        {/* Table always visible */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="text-left p-3 font-medium">Date Received</th>
                <th className="text-left p-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-800">
                  <td className="p-3 flex items-center gap-2 text-gray-100">
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
                  <td className="p-3 font-semibold text-lg">
                    ${row.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center p-3 text-gray-400">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PassiveBloomTable;
