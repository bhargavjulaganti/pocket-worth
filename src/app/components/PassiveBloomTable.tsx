import React from "react";

interface PassiveBloomTableProps {
  rows: { id: string | number; created_at?: string; amount: number }[];
  error?: string | null;
}

const PassiveBloomTable: React.FC<PassiveBloomTableProps> = ({ rows, error }) => (
  <div className="w-full flex justify-center mt-8">
    <div className="bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-5xl border border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-white">PassiveBloom Data</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-400 px-4 py-2">ID</th>
              <th className="border border-gray-400 px-4 py-2">Created At</th>
              <th className="border border-gray-400 px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-400 px-4 py-2">{row.id}</td>
                <td className="border border-gray-400 px-4 py-2">{row.created_at ? row.created_at.slice(0, 10) : ""}</td>
                <td className="border border-gray-400 px-4 py-2">{row.amount}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-400">
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

export default PassiveBloomTable;
