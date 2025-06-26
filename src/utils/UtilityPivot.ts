import { UtilityExpense } from "./UtilityExpenses";

export class UtilityPivot {
  static monthsOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  static getCategories(expenses: UtilityExpense[]): string[] {
    return Array.from(new Set(expenses.map((e) => e.category_name)));
  }

  static getPivotData(expenses: UtilityExpense[]): Record<string, Record<string, number>> {
    const pivotData: Record<string, Record<string, number>> = {};
    expenses.forEach((exp) => {
      const category = exp.category_name;
      // Parse month from create_date as local date (YYYY-MM-DD)
      const [year, monthNum] = exp.create_date.split('-');
      const month = new Date(Number(year), Number(monthNum) - 1).toLocaleString("en-US", { month: "long" });
      if (!pivotData[category]) pivotData[category] = {};
      if (!pivotData[category][month]) pivotData[category][month] = 0;
      pivotData[category][month] += Number(exp.amount);
    });
    return pivotData;
  }

  static getMonthTotals(
    pivotData: Record<string, Record<string, number>>,
    categories: string[]
  ): Record<string, number> {
    const totals: Record<string, number> = {};
    this.monthsOrder.forEach((month) => {
      totals[month] = categories.reduce(
        (sum, category) => sum + (pivotData[category][month] || 0),
        0
      );
    });
    return totals;
  }
}
