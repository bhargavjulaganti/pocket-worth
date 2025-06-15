"use client";
import { dividendData2025 } from "./dividendData";
import { utilitiesData2025 } from "./UtilitesData";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components and datalabels plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function Home() {
  // Dividend table headers and totals
  const dividendHeaders = dividendData2025.length > 0 ? Object.keys(dividendData2025[0]) : [];
  const dividendTotals: Record<string, number | string> = {};
  dividendHeaders.forEach((header) => {
    if (header === "Stock") {
      dividendTotals[header] = "Total";
    } else {
      const sum = dividendData2025.reduce(
        (sum, row) =>
          typeof row[header as keyof typeof row] === "number"
            ? sum + (row[header as keyof typeof row] as number)
            : sum,
        0
      );
      dividendTotals[header] = sum ? sum.toFixed(2) : "";
    }
  });

  // Utilities table headers and totals
  const utilitiesHeaders = utilitiesData2025.length > 0 ? Object.keys(utilitiesData2025[0]) : [];
  const utilitiesTotals: Record<string, number | string> = {};
  utilitiesHeaders.forEach((header) => {
    if (header === "Name") {
      utilitiesTotals[header] = "Total";
    } else {
      const sum = utilitiesData2025.reduce(
        (sum, row) =>
          typeof row[header as keyof typeof row] === "number"
            ? sum + (row[header as keyof typeof row] as number)
            : sum,
        0
      );
      utilitiesTotals[header] = sum ? sum.toFixed(2) : "";
    }
  });

  // Prepare months (excluding Stock/Name)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate monthly totals for dividends and utilities
  const dividendMonthlyTotals = months.map((month) =>
    dividendData2025.reduce(
      (sum, row) =>
        typeof row[month as keyof typeof row] === "number"
          ? sum + (row[month as keyof typeof row] as number)
          : sum,
      0
    )
  );

  const utilitiesMonthlyTotals = months.map((month) =>
    utilitiesData2025.reduce(
      (sum, row) =>
        typeof row[month as keyof typeof row] === "number"
          ? sum + (row[month as keyof typeof row] as number)
          : sum,
      0
    )
  );

  // Calculate percentage difference per month
  const percentLess = months.map((_, idx) => {
    const util = utilitiesMonthlyTotals[idx];
    const div = dividendMonthlyTotals[idx];
    if (util === 0) return "";
    const percent = ((util - div) / util) * 100;
    return percent.toFixed(1) + "%";
  });

  // Chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Dividends",
        data: dividendMonthlyTotals,
        backgroundColor: "#2196f3",
        // Remove datalabels from dataset, set globally in options instead
      },
      {
        label: "Utilities",
        data: utilitiesMonthlyTotals,
        backgroundColor: "#4caf50",
        // Remove datalabels from dataset, set globally in options instead
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          afterBody: (context: { dataIndex: number }[]) => {
            const idx = context[0].dataIndex;
            return `Dividends are ${percentLess[idx]} less than Utilities`;
          },
        },
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "start" as const,
        color: (context: { dataset: { label: string }}) => {
          // Blue for Dividends, Green for Utilities
          return context.dataset.label === "Dividends" ? "#2196f3" : "#4caf50";
        },
        font: { weight: "bold" },
        formatter: (value: number) => (value ? value.toFixed(2) : ""),
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Chart at the top */}
        <div className="w-full max-w-5xl mb-8">
          <Bar data={chartData} options={chartOptions} />
          <div className="flex flex-wrap justify-between mt-2 text-xs">
            {months.map((month, idx) => (
              <div
                key={month}
                className="flex flex-col items-center w-1/12 min-w-[60px]"
              >
                <span className={percentLess[idx] ? "text-red-600 font-semibold" : ""}>
                  {percentLess[idx] && `↓ ${percentLess[idx]}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dividends Table on top */}
        <div className="w-full flex justify-center">
          <div>
            <h2 className="text-xl font-semibold mb-4">Dividends</h2>
            <table className="border-collapse border">
              <thead>
                <tr className="bg-green-600 text-white">
                  {dividendHeaders.map((header) => (
                    <th key={header} className="border border-gray-400 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dividendData2025.map((row) => (
                  <tr key={row.Stock}>
                    {dividendHeaders.map((header) => (
                      <td key={header} className="border border-gray-400 px-4 py-2">
                        {row[header as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  {dividendHeaders.map((header) => (
                    <td key={header} className="border px-4 py-2">
                      {dividendTotals[header]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Utilities Table below */}
        <div className="w-full flex justify-center mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Utilities</h2>
            <table className="border-collapse border">
              <thead>
                <tr className="bg-green-600 text-white">
                  {utilitiesHeaders.map((header) => (
                    <th key={header} className="border border-gray-400 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilitiesData2025.map((row) => (
                  <tr key={row.Name}>
                    {utilitiesHeaders.map((header) => (
                      <td key={header} className="border border-gray-400 px-4 py-2">
                        {row[header as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  {utilitiesHeaders.map((header) => (
                    <td key={header} className="border px-4 py-2">
                      {utilitiesTotals[header]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
