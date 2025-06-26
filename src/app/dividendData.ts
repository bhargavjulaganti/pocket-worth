export enum StockName {
    JEPQ = "JEPQ",
    JEPI = "JEPI",
    SPYI = "SPYI",
    PFE = "PFE",
    MPW = "MPW",
}
export type DividendRow = {
  Stock: StockName;
  January: number | "";
  February: number | "";
  March: number | "";
  April: number | "";
  May: number | "";
  June: number | "";
  July: number | "";
  August: number | "";
  September: number | "";
  October: number | "";
  November: number | "";
  December: number | "";
};

// export const dividendData2025: DividendRow[] = [
//   {
//     Stock: StockName.JEPQ,
//     January: 19.29,
//     February: 21.29,
//     March: 23.37,
//     April: 27.43,
//     May: 30.68,
//     June: 32.32,
//     July: "",
//     August: "",
//     September: "",
//     October: "",
//     November: "",
//     December: ""
//   },
//   {
//     Stock: StockName.JEPI,
//     January: 22.06,
//     February: 18.33,
//     March: 18.53,
//     April: 23.21,
//     May: 27.97,
//     June: 31.23,
//     July: "",
//     August: "",
//     September: "",
//     October: "",
//     November: "",
//     December: ""
//   },
//   {
//     Stock: StockName.SPYI,
//     January: 22.83,
//     February: 22.95,
//     March: 23.68,
//     April: 21.81,
//     May: 24.16,
//     June: 24.34,
//     July: "",
//     August: "",
//     September: "",
//     October: "",
//     November: "",
//     December: ""
//   },
//     {
//         Stock: StockName.PFE,
//         January: "",
//         February: "",
//         March: 43,
//         April: "",
//         May: "",
//         June: 43,
//         July: "",
//         August: "",
//         September: "",
//         October: "",
//         November: "",
//         December: ""
//     },
//         {
//         Stock: StockName.MPW,
//         January: 20.25,
//         February: "",
//         March: "",
//         April: 20.25,
//         May: "",
//         June: "",
//         July: 20.25,
//         August: "",
//         September: "",
//         October: "",
//         November: "",
//         December: ""
//     }
// ] as const;
