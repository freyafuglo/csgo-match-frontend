"use client";

import React, { useState } from "react";
import styles from "../styles/PlayerKillsModal.module.css";
import { Kill } from "../types/matchData";

interface PlayerKillsModalProps {
  team: "TERRORIST" | "CT";
  player: string;
  killsCount: number;
  kills: Kill[];
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 4;

const formatTime = (timeStr: string) => {
  // Assuming format: "MM/DD/YYYY - HH:mm:ss"
  // Split by " - " and return the second part (time)
  return timeStr.split(" - ")[1] || timeStr;
};


const PlayerKillsModal: React.FC<PlayerKillsModalProps> = ({
  team,
  player,
  killsCount,
  kills,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const playerKills = kills.filter((kill) => {
    // Trim killer name before first "<"
    const trimmedKiller = kill.killer.split("<")[0];

    // Extract killer team from killer string: it's between last "<" and ">"
    const killerTeamMatch = kill.killer.match(/<([^>]+)>$/);
    const killerTeam = killerTeamMatch ? killerTeamMatch[1] : null;

    return trimmedKiller === player && killerTeam === team;
  });

  const formatVictimName = (victim: string): string => {
    // Extract the name and team from the victim string
    return victim.replace(/<\d+><STEAM_[\d:]+><(\w+)>/, " ($1)").split("<")[0];
  };

  const totalPages = Math.ceil(playerKills.length / ITEMS_PER_PAGE);

  const displayedKills = playerKills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <h2 className={styles.modalTitle}>
          {team} Player: {player}
        </h2>
        <div className={styles.playerInfo}>
          <p className={styles.killsCount}>Total Kills: {killsCount}</p>
          <div className={styles.killsGrid}>
            <div className={styles.gridHeader}>Round</div>
            <div className={styles.gridHeader}>Time</div>
            <div className={styles.gridHeader}>Victim</div>
            <div className={styles.gridHeader}>Weapon</div>

            {displayedKills.map((kill, index) => (
              <React.Fragment key={index}>
                <div className={styles.gridItem}>{kill.round}</div>
                <div className={styles.gridItem}>{formatTime(kill.time)}</div>
                <div className={styles.gridItem}>
                  {formatVictimName(kill.victim)}
                </div>
                <div className={styles.gridItem}>{kill.weapon}</div>
              </React.Fragment>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerKillsModal;
