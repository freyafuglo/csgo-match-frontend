"use client";

import { useState, useEffect } from "react";
import { useMemo } from "react";
import { MatchData } from "../types/matchData";
import PlayerKillsModal from "../components/PlayerKillsModal";

export default function Home() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    team: "TERRORIST" | "CT";
    player: string;
  } | null>(null);

  const fetchMatchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/stats/match-stats"
      );
      const data: MatchData = await response.json();
      setMatchData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  };

  useEffect(() => {
    fetchMatchData();
  }, []); // Runs once when the component mounts

  const deathsByNameAndTeam: Record<string, Record<string, number>> = {};

  if (matchData && matchData.deaths) {
    for (const fullKey in matchData.deaths) {
      const match = fullKey.match(/^([^<]+).*<([A-Z]+)>$/); // Extract player name and team
      if (match) {
        const playerName = match[1].trim();
        const team = match[2];

        // Initialize the nested object if not already done
        if (!deathsByNameAndTeam[playerName]) {
          deathsByNameAndTeam[playerName] = { TERRORIST: 0, CT: 0 };
        }

        // Sum up deaths for the specific team
        deathsByNameAndTeam[playerName][team] += matchData.deaths[fullKey];
      }
    }
  }

  return (
    <div className="container">
      <h1>CS:GO Match Analyzer</h1>
      <br></br>
      {matchData ? (
        <div className="statsCard">
          <h2>Match Statistics</h2>
          <div className="statsGrid">
            <div className="statItem">
              <span className="statLabel">Average Round Length:</span>
              <span className="statValue">
                {matchData.averageRoundLength} seconds
              </span>
            </div>
            <div className="statItem">
              <span className="statLabel">Bomb Plants:</span>
              <span className="statValue">{matchData.bombPlants}</span>
            </div>
            <div className="statItem">
              <span className="statLabel">Most Kills in a Round:</span>
              <span className="statValue">{matchData.mostKillsInRound}</span>
            </div>

            <div className="statItem">
              <span className="statLabel">Bomb Defuses:</span>
              <span className="statValue">{matchData.bombDefuses}</span>
            </div>
          </div>

          <h3>Rounds Won</h3>
          <ul className="roundsWonList">
            {Object.entries(matchData.roundsWon).map(([team, rounds]) => (
              <li key={team}>
                <strong className="teamName">{team}: </strong>
                <span className="roundsCount">{rounds}</span>
              </li>
            ))}
          </ul>

          <div className="killsGrid">
            {(["TERRORIST", "CT"] as const).map((team) => {
              const teamKills = Object.values(
                matchData.groupedKills[team] || {}
              ).reduce((a, b) => a + b, 0);
              const teamClass =
                team === "TERRORIST" ? "terroristColumn" : "ctColumn";

              return (
                <div key={team} className={`killsColumn ${teamClass}`}>
                  <h4 className="killsHeading">
                    {team} - Total Kills: {teamKills}
                  </h4>
                  <ul className="killsList">
                    <li className="killsListHeader">
                      <span className="playerName">Player</span>
                      <span className="killCount">Kills</span>
                      <span className="deathCount">Deaths</span>
                      <span className="kdaCount">KDA</span>
                    </li>
                    {Object.entries(matchData.groupedKills[team] || {})
                      .sort(([, killsA], [, killsB]) => killsB - killsA)
                      .map(([player, kills]) => {
                        const deaths = deathsByNameAndTeam[player]?.[team] || 0;
                        const kda =
                          deaths > 0 ? (kills / deaths).toFixed(2) : kills;
                        return (
                          <li key={player} className="killsListItem">
                            <span className="playerName">{player}</span>

                            <button
                              className="killsButton"
                              onClick={() =>
                                setSelectedPlayer({ team, player })
                              }
                              title="Show kills"
                            >
                              {kills}
                            </button>

                            <span className="deathCount" title="Deaths">
                              {deaths}
                            </span>

                            <span className="kdaCount" title="KDA">
                              {kda}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Loading match data...</p>
      )}

      {selectedPlayer && matchData && (
        <PlayerKillsModal
          team={selectedPlayer.team}
          player={selectedPlayer.player}
          killsCount={
            matchData.groupedKills[selectedPlayer.team]?.[
              selectedPlayer.player
            ] ?? 0
          }
          kills={matchData.kills} // <-- pass all kills
          isOpen={true}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
