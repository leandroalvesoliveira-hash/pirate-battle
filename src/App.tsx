import { useState } from "react";
import PirateGame from "./PirateGame";
import RankingScreen from "./components/RankingScreen";
type GameSettings = {
  sessionTime: number;
  enemySpawnTime: number;
};

const DEFAULT_SETTINGS: GameSettings = {
  sessionTime: 120,
  enemySpawnTime: 3,
};

function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem("pirate-battle-settings");

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (parsed && typeof parsed === "object") {
        const values = parsed as Partial<GameSettings>;

        if (
          typeof values.sessionTime === "number" &&
          Number.isInteger(values.sessionTime) &&
          values.sessionTime >= 60 &&
          values.sessionTime <= 180 &&
          typeof values.enemySpawnTime === "number" &&
          Number.isInteger(values.enemySpawnTime) &&
          values.enemySpawnTime >= 1 &&
          values.enemySpawnTime <= 10
        ) {
          return {
            sessionTime: values.sessionTime,
            enemySpawnTime: values.enemySpawnTime,
          };
        }
      }
    }
  } catch {
    //
  }

  return DEFAULT_SETTINGS;
}

type GameScreen = "menu" | "options" | "game" | "ranking";
type RankingTab = "ranking" | "history";

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [gameId, setGameId] = useState(0);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [rankingTab, setRankingTab] = useState<RankingTab>("ranking");

  const openRanking = (tab: RankingTab) => {
    setRankingTab(tab);
    setScreen("ranking");
  };

  const changeSetting = (field: keyof GameSettings, amount: number) => {
    setSettings((previous) => {
      const min = field === "sessionTime" ? 60 : 1;
      const max = field === "sessionTime" ? 180 : 10;

      const updated = {
        ...previous,
        [field]: Math.max(min, Math.min(max, previous[field] + amount)),
      };

      try {
        localStorage.setItem("pirate-battle-settings", JSON.stringify(updated));
      } catch {
      }

      return updated;
    });
  };
  const startGame = () => {
    setGameId((previousId) => previousId + 1);
    setScreen("game");
  };

  const returnToMenu = () => {
    setScreen("menu");
  };

  if (screen === "game") {
    return (
      <PirateGame
        key={gameId}
        onRestart={startGame}
        onMainMenu={returnToMenu}
        sessionTime={settings.sessionTime}
        enemySpawnTime={settings.enemySpawnTime}
      />
    );
  }

  if (screen === "ranking") {
    return (
      <div style={pageStyle}>
        <RankingScreen
          initialTab={rankingTab}
          onBack={() => setScreen("menu")}
        />
      </div>
    );
  }

  if (screen === "options") {
    return (
      <div style={pageStyle}>
        <div style={panelStyle}>
          <h1 style={{ fontSize: "32px", marginBottom: "35px" }}>OPTIONS</h1>

          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            GAME SESSION TIME
          </p>

          <div style={settingRowStyle}>
            <button
              style={roundButtonStyle}
              aria-label="Decrease session time"
              disabled={settings.sessionTime <= 60}
              onClick={() => changeSetting("sessionTime", -30)}
            >
              <img
                src="/assets/png/default/ui/controls/icon_minus.png"
                alt=""
                style={roundIconStyle}
              />
            </button>

            <span style={settingValueStyle}>{settings.sessionTime} s</span>

            <button
              style={roundButtonStyle}
              aria-label="Increase session time"
              disabled={settings.sessionTime >= 180}
              onClick={() => changeSetting("sessionTime", 30)}
            >
              <img
                src="/assets/png/default/ui/controls/icon_plus.png"
                alt=""
                style={roundIconStyle}
              />
            </button>
          </div>

          <p
            style={{ fontSize: "18px", fontWeight: "bold", marginTop: "30px" }}
          >
            ENEMY SPAWN TIME
          </p>

          <div style={settingRowStyle}>
            <button
              style={roundButtonStyle}
              aria-label="Decrease enemy spawn time"
              disabled={settings.enemySpawnTime <= 1}
              onClick={() => changeSetting("enemySpawnTime", -1)}
            >
              <img
                src="/assets/png/default/ui/controls/icon_minus.png"
                alt=""
                style={roundIconStyle}
              />
            </button>

            <span style={settingValueStyle}>{settings.enemySpawnTime} s</span>

            <button
              style={roundButtonStyle}
              aria-label="Increase enemy spawn time"
              disabled={settings.enemySpawnTime >= 10}
              onClick={() => changeSetting("enemySpawnTime", 1)}
            >
              <img
                src="/assets/png/default/ui/controls/icon_plus.png"
                alt=""
                style={roundIconStyle}
              />
            </button>
          </div>

          <button
            style={{ ...buttonStyle, marginTop: "40px" }}
            onClick={() => setScreen("menu")}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <img
          src="/assets/png/default/ui/menu/title_pirate_battle.png"
          alt="Pirate Battle"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "400px",
            height: "auto",
            margin: "0 auto 10px",
          }}
        />
        <p style={{ letterSpacing: "3px", fontSize: "12px" }}>
          SET SAIL. TAKE COMMAND.
        </p>

        <div style={{ marginTop: "35px" }}>
          <button style={buttonStyle} onClick={startGame}>
            PLAY
          </button>

          <button style={buttonStyle} onClick={() => setScreen("options")}>
            OPTIONS
          </button>
        </div>

        <p style={{ marginTop: "35px" }}>
          Navigate the islands. Survive the battle.
        </p>

        <div style={{ marginTop: "25px" }}>
          <button
            style={smallButtonStyle}
            onClick={() => openRanking("ranking")}
          >
            RANKING
          </button>

          <button
            style={smallButtonStyle}
            onClick={() => openRanking("history")}
          >
            MATCH HISTORY
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#126782",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "600px",
  minHeight: "540px",
  padding: "55px 35px",
  boxSizing: "border-box",
  textAlign: "center",
  color: "#ffe3a4",

  backgroundImage: 'url("/assets/png/default/ui/menu/panel_menu.png")',
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundColor: "transparent",

  border: "none",
  borderRadius: "0",
  boxShadow: "none",
};

const buttonStyle: React.CSSProperties = {
  display: "block",
  width: "260px",
  height: "65px",
  margin: "15px auto",

  backgroundImage:
    'url("/assets/png/default/ui/menu/button_primary_normal.png")',
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundColor: "transparent",

  border: "none",
  borderRadius: "0",
  color: "#30271e",
  fontSize: "22px",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  display: "inline-block",
  width: "170px",
  height: "50px",
  margin: "8px",
  fontSize: "15px",
  color: "#ffffff",

  backgroundImage:
    'url("/assets/png/default/ui/menu/button_secondary_normal.png")',
};

const settingRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "22px",
  marginTop: "12px",
};

const roundButtonStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  padding: "0",
  border: "none",
  backgroundColor: "transparent",
  backgroundImage:
    'url("/assets/png/default/ui/controls/button_round_normal.png")',
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const roundIconStyle: React.CSSProperties = {
  width: "23px",
  height: "23px",
  objectFit: "contain",
  pointerEvents: "none",
};

const settingValueStyle: React.CSSProperties = {
  minWidth: "90px",
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center",
};
