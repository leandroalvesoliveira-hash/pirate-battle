import { useState } from "react";
import "../styles/RankingScreen.css";

type RankingScreenProps = {
  onBack: () => void;
  initialTab?: "ranking" | "history";
};

type MatchResult = {
  score: number;
  playedAt: string;
  captainName?: string;
};

export default function RankingScreen({
  onBack,
  initialTab = "ranking",
}: RankingScreenProps) {
  const [activeTab, setActiveTab] = useState<"ranking" | "history">(initialTab);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Carrega as partidas salvas
  const [matches] = useState<MatchResult[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("pirateBattleHistory") || "[]",
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Considera apenas partidas com nome
  const namedMatches = matches.filter((match) => match.captainName?.trim());

  // Ranking: maior pontuação primeiro
  const ranking = [...namedMatches].sort((a, b) => b.score - a.score);

  // Histórico: partidas mais recentes primeiro
  const history = [...namedMatches].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
  );

  const displayedMatches = activeTab === "ranking" ? ranking : history;

  // Paginação
  const totalPages = Math.max(
    1,
    Math.ceil(displayedMatches.length / itemsPerPage),
  );

  const paginatedMatches = displayedMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="ranking-overlay">
      <div className="ranking-panel">
        <h1>CAPTAIN'S LOG</h1>

        <div className="ranking-tabs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ranking");
              setCurrentPage(1);
            }}
          >
            RANKING
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              setCurrentPage(1);
            }}
          >
            MATCH HISTORY
          </button>
        </div>

        <div className="ranking-ship">
          <img src="/assets/png/default/ships/ship_1.png" alt="Pirate ship" />
        </div>

        <div className="ranking-list">
          <div className="ranking-header">
            <span>RANK</span>
            <span>CAPTAIN</span>
            <span>POINTS</span>
            <span>PLAYED</span>
          </div>

          {paginatedMatches.length === 0 ? (
            <p>No scores saved yet.</p>
          ) : (
            paginatedMatches.map((match, index) => (
              <div className="ranking-item" key={`${match.playedAt}-${index}`}>
                <span className="ranking-position">
                  {String(
                    (currentPage - 1) * itemsPerPage + index + 1,
                  ).padStart(2, "0")}
                </span>

                <span className="ranking-captain">{match.captainName}</span>

                <strong className="ranking-points">{match.score}</strong>

                <span className="ranking-date">
                  {new Date(match.playedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        <div className="ranking-pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            <img
              src="/assets/png/retina/ui/controls/icon_turn_left.png"
              alt=""
              className="ranking-arrow-icon"
            />
          </button>

          <span>
            PAGE {currentPage} OF {totalPages}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            <img
              src="/assets/png/retina/ui/controls/icon_turn_right.png"
              alt=""
              className="ranking-arrow-icon"
            />
          </button>
        </div>

        <button type="button" onClick={onBack}>
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
