"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="container">
      <h1>CSGO Match Analyzer</h1>
      <br></br>
      {matchData ? (
        <div className="stats">
          <h2>Match Statistics</h2>
          <p>Average Round Length: {matchData.averageRoundLength} seconds</p>
          <p>Most Kills in a Round: {matchData.mostKillsInRound}</p>
          <p>Bomb Plants: {matchData.bombPlants}</p>
          <p>Bomb Defuses: {matchData.bombDefuses}</p>

          <h3>Rounds Won</h3>
          <ul>
            {Object.entries(matchData.roundsWon).map(([team, rounds]) => (
              <li key={team}>
                {team}: {rounds}
              </li>
            ))}
          </ul>

          <h3>Kills by Team</h3>
          <div className="killsGrid">
            {(["TERRORIST", "CT"] as const).map((team) => {
              const teamKills = Object.values(
                matchData.groupedKills[team] || {}
              ).reduce((a, b) => a + b, 0);

              return (
                <div key={team} className="killsColumn">
                  <h4 className="killsHeading">
                    {team} - Total Kills: {teamKills}
                  </h4>
                  <ul className="killsList">
                    {Object.entries(matchData.groupedKills[team] || {})
                      .sort(([, killsA], [, killsB]) => killsB - killsA) // Sort descending by kills
                      .map(([player, kills]) => (
                        <li
                          key={player}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{player}</span>
                          <button
                            className="killsButton"
                            onClick={() => setSelectedPlayer({ team, player })}
                          >
                            {kills}
                          </button>
                        </li>
                      ))}
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
