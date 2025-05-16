export interface Kill {
  round: number;
  time: string;
  killer: string;
  victim: string;
  weapon: string;
}

export interface MatchData {
  averageRoundLength: number;
  totalKills: Record<string, number>;
  roundsWon: Record<string, number>;
  mostKillsInRound: number;
  deaths: Record<string, number>;
  bombPlants: number;
  bombDefuses: number;
  kills: Kill[];
  groupedKills: Record<"TERRORIST" | "CT", Record<string, number>>;
}
