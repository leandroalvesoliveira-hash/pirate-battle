import "../styles/GameOverScreen.css";
import { useState } from "react";

type GameOverScreenProps = {
  score: number;
  elapsedTime: number;
  onRestart: () => void;
  onMainMenu: () => void;
};

export default function GameOverScreen({
  score,
  elapsedTime,
  onRestart,
  onMainMenu,
}: GameOverScreenProps) {
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = Math.floor(elapsedTime % 60);
  const [captainName, setCaptainName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="game-over-overlay">
      <div className="game-over-panel">
        <h1>BATTLE COMPLETE</h1>

        <div className="game-over-score">{score}</div>

        <p>POINTS · {formattedTime} · GAME OVER</p>

        <label htmlFor="captain-name" className="captain-name-label">
          CAPTAIN'S NAME
        </label>

        <input
          id="captain-name"
          className="captain-name-input"
          type="text"
          placeholder="Enter your name"
          maxLength={20}
          autoComplete="off"
          value={captainName}
          onChange={(event) => setCaptainName(event.target.value)}
        />

        <button
          type="button"
          disabled={!captainName.trim() || scoreSaved}
          onClick={() => {
            try {
              const history = JSON.parse(
                localStorage.getItem("pirateBattleHistory") || "[]",
              );

              if (!Array.isArray(history) || history.length === 0) {
                console.error("Nenhuma partida encontrada para salvar.");
                return;
              }
              const lastMatch = history[history.length - 1];

              lastMatch.captainName = captainName.trim();

              localStorage.setItem(
                "pirateBattleHistory",
                JSON.stringify(history),
              );

              console.log("Pontuação salva:", lastMatch);
              setScoreSaved(true);
            } catch (error) {
              console.error("Erro ao salvar pontuação:", error);
            }
          }}
        >
          {scoreSaved ? "SCORE SAVED ✓" : "SAVE SCORE"}{" "}
        </button>

        <button onClick={onRestart}>PLAY AGAIN</button>

        <button onClick={onMainMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
