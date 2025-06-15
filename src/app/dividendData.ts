export type DividendRow = {
  Stock: string;
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

export const dividendData2025: DividendRow[] = [
  {
    Stock: "JEPQ",
    January: 19.29,
    February: 21.29,
    March: 23.37,
    April: 27.43,
    May: 30.68,
    June: 32.32,
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Stock: "JEPI",
    January: 22.06,
    February: 18.33,
    March: 18.53,
    April: 23.21,
    May: 27.97,
    June: 31.23,
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Stock: "SPYI",
    January: 22.83,
    February: 22.95,
    March: 23.68,
    April: 21.81,
    May: 24.16,
    June: "",
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  }
];
