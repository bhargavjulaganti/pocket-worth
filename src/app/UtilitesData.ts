export enum UtilityName {
  DTE = "DTE",
  ConsumersEnergy = "ConsumersEnergy",
  Internet = "Internet",
  Mobile = "Mobile",
  Water = "Water"
}

export type UtilityRow = {
  Name: UtilityName;
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

export const utilitiesData2025: UtilityRow[] = [
  {
    Name: UtilityName.DTE,
    January: 97.05,
    February: 116.71,
    March: 109.39,
    April: 102.75,
    May: 110.28,
    June: 103.71,
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Name: UtilityName.ConsumersEnergy,
    January: 122.86,
    February: 159.72,
    March: 132.23,
    April: 96.71,
    May: 82.94,
    June: 47.64,
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Name: UtilityName.Internet,
    January: 30,
    February: 34.99,
    March: 30,
    April: 30,
    May: 30,
    June: "",
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Name: UtilityName.Mobile,
    January: 23,
    February: 23,
    March: 23,
    April: 23,
    May: 23,
    June: 53,
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  },
  {
    Name: UtilityName.Water,
    January: "",
    February: 177.05,
    March: "",
    April: "",
    May: 183.97,
    June: "",
    July: "",
    August: "",
    September: "",
    October: "",
    November: "",
    December: ""
  }
];
