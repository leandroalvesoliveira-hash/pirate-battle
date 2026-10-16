import { useEffect, useRef, useState } from "react";
import {
  Application,
  Assets,
  Sprite,
  Graphics,
  type Texture,
  type Ticker,
  TilingSprite,
} from "pixi.js";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
  CANNONBALL_SPEED,
  SHOOT_COOLDOWN,
  PLAYER_MAX_HEALTH,
  ENEMY_MAX_HEALTH,
  COLLISION_DAMAGE,
  COLLISION_COOLDOWN,
  POINTS_PER_ENEMY,
  SHIP_COLLISION_RADIUS,
  CANNONBALL_HIT_RADIUS,
  ENEMY_SHOOT_COOLDOWN,
  ENEMY_CANNONBALL_SPEED,
  ENEMY_CANNONBALL_DAMAGE,
} from "./game/constants";
import type { Cannonball } from "./game/types";
import { calculateDistance } from "./game/collision";
import { createExplosion } from "./game/effects";
import {
  createCannonball,
  moveCannonball,
  destroyCannonball,
} from "./game/projectiles";
import { createEnemy, moveEnemy } from "./game/enemy";
import {
  createIsland,
  ISLAND_X,
  ISLAND_Y,
  ISLAND_COLLISION_RADIUS,
} from "./game/island";
import GameOverScreen from "./components/GameOverScreen";

type PirateGameProps = {
  onRestart: () => void;
  onMainMenu: () => void;
  sessionTime: number;
  enemySpawnTime: number;
};

export default function PirateGame({
  onRestart,
  onMainMenu,
  sessionTime,
  enemySpawnTime,
}: PirateGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameResult, setGameResult] = useState<{
    score: number;
    elapsedTime: number;
  } | null>(null);

  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const resumeGameRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = new Application();
    const keys = new Set<string>();
    container.style.position = "relative";

    const scorePanel = document.createElement("div");

    scorePanel.style.position = "absolute";
    scorePanel.style.top = "15px";
    scorePanel.style.right = "235px";
    scorePanel.style.width = "140px";
    scorePanel.style.height = "50px";
    scorePanel.style.zIndex = "20";

    scorePanel.style.backgroundImage =
      'url("/assets/png/default/ui/hud/counter_panel.png")';
    scorePanel.style.backgroundSize = "100% 100%";
    scorePanel.style.backgroundRepeat = "no-repeat";

    scorePanel.style.display = "flex";
    scorePanel.style.alignItems = "center";
    scorePanel.style.justifyContent = "center";
    scorePanel.style.gap = "10px";

    scorePanel.style.pointerEvents = "none";
    const scoreIcon = document.createElement("img");

    scoreIcon.src = "/assets/png/default/ui/hud/icon_score.png";
    scoreIcon.style.width = "30px";
    scoreIcon.style.height = "30px";
    scoreIcon.style.objectFit = "contain";

    const scoreText = document.createElement("span");

    scoreText.textContent = "0";
    scoreText.style.color = "#ffffff";
    scoreText.style.fontSize = "24px";
    scoreText.style.fontWeight = "bold";
    scoreText.style.textShadow = "2px 2px 2px #000000";

    scorePanel.appendChild(scoreIcon);
    scorePanel.appendChild(scoreText);

    container.appendChild(scorePanel);
    const timePanel = document.createElement("div");

    timePanel.style.position = "absolute";
    timePanel.style.top = "15px";
    timePanel.style.right = "75px";
    timePanel.style.width = "140px";
    timePanel.style.height = "50px";
    timePanel.style.zIndex = "20";

    timePanel.style.backgroundImage =
      'url("/assets/png/default/ui/hud/counter_panel.png")';

    timePanel.style.backgroundSize = "100% 100%";
    timePanel.style.backgroundRepeat = "no-repeat";

    timePanel.style.display = "flex";
    timePanel.style.alignItems = "center";
    timePanel.style.justifyContent = "center";
    timePanel.style.gap = "8px";
    timePanel.style.pointerEvents = "none";

    const timeIcon = document.createElement("img");

    timeIcon.src = "/assets/png/default/ui/hud/icon_time.png";
    timeIcon.style.width = "28px";
    timeIcon.style.height = "28px";
    timeIcon.style.objectFit = "contain";

    const timeText = document.createElement("span");

    timeText.textContent = `${String(Math.floor(sessionTime / 60)).padStart(2, "0")}:${String(sessionTime % 60).padStart(2, "0")}`;
    timeText.style.color = "#ffffff";
    timeText.style.fontSize = "23px";
    timeText.style.fontWeight = "bold";
    timeText.style.textShadow = "2px 2px 2px #000000";
    timeText.style.fontVariantNumeric = "tabular-nums";

    timePanel.appendChild(timeIcon);
    timePanel.appendChild(timeText);

    container.appendChild(timePanel);

    let isPaused = false;

    const pauseButton = document.createElement("button");

    pauseButton.type = "button";
    pauseButton.style.position = "absolute";
    pauseButton.style.top = "15px";
    pauseButton.style.right = "15px";
    pauseButton.style.width = "50px";
    pauseButton.style.height = "50px";
    pauseButton.style.zIndex = "30";

    pauseButton.style.backgroundImage =
      'url("/assets/png/default/ui/controls/button_round_normal.png")';

    pauseButton.style.backgroundSize = "100% 100%";
    pauseButton.style.backgroundRepeat = "no-repeat";
    pauseButton.style.backgroundColor = "transparent";

    pauseButton.style.border = "none";
    pauseButton.style.padding = "0";
    pauseButton.style.cursor = "pointer";

    pauseButton.style.display = "flex";
    pauseButton.style.alignItems = "center";
    pauseButton.style.justifyContent = "center";

    const pauseIcon = document.createElement("img");

    pauseIcon.src = "/assets/png/default/ui/controls/icon_pause.png";
    pauseIcon.style.width = "25px";
    pauseIcon.style.height = "25px";
    pauseIcon.style.objectFit = "contain";
    pauseIcon.style.pointerEvents = "none";

    pauseButton.appendChild(pauseIcon);

    pauseButton.addEventListener("click", () => {
      if (gameOver || disposed || isPaused) return;

      isPaused = true;
      keys.clear();
      setIsPauseMenuOpen(true);
    });

    resumeGameRef.current = () => {
      if (disposed || gameOver) return;

      isPaused = false;
      keys.clear();
      setIsPauseMenuOpen(false);
    };

    pauseButton.title = "Pausar jogo";
    pauseButton.setAttribute("aria-label", "Pausar jogo");

    container.appendChild(pauseButton);
    let disposed = false;
    let initialized = false;
    let ship: Sprite | undefined;
    let playerHealthBarFrame: Sprite | undefined;
    let playerHealthBarFill: Sprite | undefined;
    let fireTexture1: Texture;
    let fireTexture2: Texture;
    let destroyedShipTexture: Texture;
    let destroyedSailTexture: Texture;
    let enemyHealthFrameTexture: Texture;
    let enemyHealthGreenTexture: Texture;
    let enemyHealthRedTexture: Texture;
    type EnemyType = "chaser" | "shooter";

    type EnemyInstance = {
      sprite: Sprite;
      type: EnemyType;
      health: number;
      lastShot: number;
      healthBarFrame: Sprite;
      healthBarFill: Sprite;
    };

    const enemies: EnemyInstance[] = [];
    let playerHealth = PLAYER_MAX_HEALTH;
    let gameOver = false;
    let lastCollisionTime = 0;

    container.style.position = "relative";

    const healthText = document.createElement("div");

    healthText.style.position = "absolute";
    healthText.style.top = "15px";
    healthText.style.left = "15px";
    healthText.style.width = "240px";
    healthText.style.height = "55px";
    healthText.style.zIndex = "20";
    healthText.style.display = "flex";
    healthText.style.alignItems = "center";
    healthText.style.pointerEvents = "none";

    const healthFrame = document.createElement("div");

    healthFrame.style.position = "relative";
    healthFrame.style.width = "240px";
    healthFrame.style.height = "55px";

    healthFrame.style.backgroundImage =
      'url("/assets/png/default/ui/hud/health_frame.png")';

    healthFrame.style.backgroundSize = "100% 100%";
    healthFrame.style.backgroundRepeat = "no-repeat";

    const healthBackground = document.createElement("div");

    healthBackground.style.position = "absolute";
    healthBackground.style.left = "30px";
    healthBackground.style.right = "28px";
    healthBackground.style.top = "12px";
    healthBackground.style.height = "31px";
    healthBackground.style.overflow = "hidden";
    healthBackground.style.borderRadius = "4px";

    const healthFill = document.createElement("div");

    healthFill.style.width = "100%";
    healthFill.style.height = "100%";
    healthFill.style.backgroundImage =
      'url("/assets/png/default/ui/hud/health_fill_green.png")';

    healthFill.style.backgroundPosition = "center";
    healthFill.style.backgroundRepeat = "no-repeat";
    healthFill.style.transition = "width 0.2s ease";

    const heart = document.createElement("img");

    heart.src = "/assets/png/default/ui/hud/icon_heart.png";

    heart.style.position = "absolute";
    heart.style.left = "-12px";
    heart.style.top = "10px";
    heart.style.width = "40px";
    heart.style.height = "40px";
    heart.style.objectFit = "contain";

    const healthValue = document.createElement("span");

    healthValue.textContent = `${playerHealth} / ${PLAYER_MAX_HEALTH}`;

    healthValue.style.position = "absolute";
    healthValue.style.left = "66px";
    healthValue.style.right = "28px";
    healthValue.style.top = "12px";
    healthValue.style.height = "31px";

    healthValue.style.display = "flex";
    healthValue.style.alignItems = "center";
    healthValue.style.justifyContent = "center";

    healthValue.style.color = "#ffffff";
    healthValue.style.fontSize = "15px";
    healthValue.style.fontWeight = "bold";
    healthValue.style.textShadow = "1px 2px 3px #000000";

    healthBackground.appendChild(healthFill);

    healthFrame.appendChild(healthBackground);
    healthFrame.appendChild(heart);
    healthFrame.appendChild(healthValue);

    healthText.appendChild(healthFrame);

    container.appendChild(healthText);

    const updateHealthBar = () => {
      const healthPercentage = (playerHealth / PLAYER_MAX_HEALTH) * 100;

      healthFill.style.width = `${healthPercentage}%`;

      healthValue.textContent = `${playerHealth} / ${PLAYER_MAX_HEALTH}`;

      let healthColor = "green";

      if (healthPercentage <= 30) {
        healthColor = "red";
      } else if (healthPercentage <= 60) {
        healthColor = "amber";
      }

      healthFill.style.backgroundImage = `url("/assets/png/default/ui/hud/health_fill_${healthColor}.png")`;
    };

    let score = 0;
    let elapsedTime = 0;
    let spawnTimer = 0;
    const cannonballs: Cannonball[] = [];
    let lastShot = 0;

    const enemyCannonballs: Cannonball[] = [];

    const gameKeys = [
      "KeyW",
      "KeyA",
      "KeyD",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyQ",
      "KeyE",
    ];

    const onKeyDown = (event: KeyboardEvent) => {
      if (gameKeys.includes(event.code)) {
        event.preventDefault();
        keys.add(event.code);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
    };

    const onBlur = () => {
      keys.clear();
    };
    const createDestroyedShipEffect = (
      x: number,
      y: number,
      rotation: number,
    ) => {
      if (disposed || gameOver) return;

      const wreck = new Sprite(destroyedShipTexture);

      wreck.anchor.set(0.5);
      wreck.position.set(x, y);
      wreck.rotation = rotation;
      wreck.width = 65;
      wreck.height = 85;

      app.stage.addChild(wreck);

      let elapsed = 0;

      const animateWreck = (ticker: Ticker) => {
        if (disposed || gameOver) {
          app.ticker.remove(animateWreck);
          if (!wreck.destroyed) wreck.destroy();
          return;
        }

        if (isPaused) return;

        elapsed += ticker.deltaMS;

        if (elapsed >= 800) {
          app.ticker.remove(animateWreck);
          wreck.destroy();
        } else if (elapsed >= 500) {
          if (wreck.texture !== destroyedSailTexture) {
            wreck.texture = destroyedSailTexture;

            wreck.scale.set(1);

            const maxSize = 45;
            const scale = Math.min(
              maxSize / destroyedSailTexture.width,
              maxSize / destroyedSailTexture.height,
            );

            wreck.scale.set(scale);
          }
        }
      };

      app.ticker.add(animateWreck);
    };
    const createFireEffect = (x: number, y: number, rotation: number) => {
      if (disposed || gameOver) return;

      const fire = new Sprite(fireTexture1);

      fire.anchor.set(0.5);
      fire.position.set(x, y);
      fire.rotation = rotation;
      fire.width = 35;
      fire.height = 45;

      app.stage.addChild(fire);

      let elapsed = 0;

      const animateFire = (ticker: Ticker) => {
        if (disposed || gameOver) {
          app.ticker.remove(animateFire);
          if (!fire.destroyed) fire.destroy();
          return;
        }

        if (isPaused) return;

        elapsed += ticker.deltaMS;

        if (elapsed >= 270) {
          app.ticker.remove(animateFire);
          fire.destroy();
        } else if (elapsed >= 120) {
          fire.texture = fireTexture2;
        }
      };

      app.ticker.add(animateFire);
    };

    const shoot = (direction: number) => {
      if (!ship || disposed || gameOver || isPaused) return;

      const now = performance.now();
      if (now - lastShot < SHOOT_COOLDOWN) return;

      lastShot = now;

      const angle = ship.rotation + direction;

      if (direction === 0) {
        const cannonball = createCannonball(
          app,
          ship.x + Math.sin(angle) * 45,
          ship.y - Math.cos(angle) * 45,
          Math.sin(angle) * CANNONBALL_SPEED,
          -Math.cos(angle) * CANNONBALL_SPEED,
          0x202020,
          1.5,
        );

        createFireEffect(
          ship.x + Math.sin(angle) * 45,
          ship.y - Math.cos(angle) * 45,
          angle,
        );

        cannonballs.push(cannonball);
        return;
      }

      const cannonPositions = [-25, 0, 25];

      for (const offset of cannonPositions) {
        const cannonball = createCannonball(
          app,

          ship.x + Math.sin(angle) * 32 + Math.sin(ship.rotation) * offset,

          ship.y - Math.cos(angle) * 32 - Math.cos(ship.rotation) * offset,

          Math.sin(angle) * CANNONBALL_SPEED,
          -Math.cos(angle) * CANNONBALL_SPEED,

          0x202020,
          1.5,
        );
        createFireEffect(
          ship.x + Math.sin(angle) * 32 + Math.sin(ship.rotation) * offset,
          ship.y - Math.cos(angle) * 32 - Math.cos(ship.rotation) * offset,
          angle,
        );

        cannonballs.push(cannonball);
      }
    };

    const enemyShoot = (enemy: EnemyInstance) => {
      if (!ship || disposed || gameOver || isPaused) return;

      const currentTime = performance.now();

      if (currentTime - enemy.lastShot < ENEMY_SHOOT_COOLDOWN) {
        return;
      }

      enemy.lastShot = currentTime;

      const distanceX = ship.x - enemy.sprite.x;
      const distanceY = ship.y - enemy.sprite.y;

      const angle = Math.atan2(distanceY, distanceX);

      const cannonball = createCannonball(
        app,
        enemy.sprite.x + Math.cos(angle) * 35,
        enemy.sprite.y + Math.sin(angle) * 35,
        Math.cos(angle) * ENEMY_CANNONBALL_SPEED,
        Math.sin(angle) * ENEMY_CANNONBALL_SPEED,
        0xff4444,
        2,
      );

      createFireEffect(
        enemy.sprite.x + Math.cos(angle) * 35,
        enemy.sprite.y + Math.sin(angle) * 35,
        angle + Math.PI / 2,
      );

      enemyCannonballs.push(cannonball);
    };

    const endGame = () => {
      if (gameOver) return;

      gameOver = true;
      keys.clear();
      setGameResult({
        score,
        elapsedTime,
      });

      const matchResult = {
        score,
        playedAt: new Date().toISOString(),
      };

      try {
        const savedMatches = JSON.parse(
          localStorage.getItem("pirateBattleHistory") || "[]",
        );

        const history = Array.isArray(savedMatches) ? savedMatches : [];

        history.push(matchResult);

        localStorage.setItem("pirateBattleHistory", JSON.stringify(history));

        console.log("Partida salva no histórico:", matchResult);
      } catch (error) {
        console.error("Erro ao salvar histórico:", error);
      }
    };

    const spawnEnemy = async () => {
      if (disposed || gameOver || isPaused || !ship) return;

      const newEnemy = await createEnemy(ship.x, ship.y);

      if (disposed || gameOver) {
        newEnemy.destroy();
        return;
      }

      const enemyType: EnemyType = Math.random() < 0.5 ? "chaser" : "shooter";
      newEnemy.tint = enemyType === "chaser" ? 0xff5555 : 0x5599ff;
      const healthBarFrame = new Sprite(enemyHealthFrameTexture);
      healthBarFrame.anchor.set(0.5);
      healthBarFrame.width = 70;
      healthBarFrame.height = 14;
      healthBarFrame.position.set(newEnemy.x, newEnemy.y - 60);
      const healthBarFill = new Sprite(enemyHealthGreenTexture);
      healthBarFill.anchor.set(0, 0.5);
      healthBarFill.width = 60;
      healthBarFill.height = 8;
      healthBarFill.position.set(newEnemy.x - 30, newEnemy.y - 60);
      enemies.push({
        sprite: newEnemy,
        type: enemyType,
        health: ENEMY_MAX_HEALTH,
        lastShot: 0,
        healthBarFrame,
        healthBarFill,
      });

      app.stage.addChild(newEnemy);
      app.stage.addChild(healthBarFrame);
      app.stage.addChild(healthBarFill);
    };
    const update = (ticker: Ticker) => {
      if (!ship || disposed || gameOver || isPaused) return;

      if (playerHealthBarFrame && playerHealthBarFill) {
        playerHealthBarFrame.position.set(ship.x, ship.y - 65);
        playerHealthBarFill.position.set(ship.x - 30, ship.y - 65);

        const healthPercentage = playerHealth / PLAYER_MAX_HEALTH;

        playerHealthBarFill.width = 60 * healthPercentage;

        playerHealthBarFill.texture =
          healthPercentage <= 0.3
            ? enemyHealthRedTexture
            : enemyHealthGreenTexture;

        playerHealthBarFill.tint =
          healthPercentage > 0.3 && healthPercentage <= 0.6
            ? 0xffff00
            : 0xffffff;
      }

      const deltaTime = Math.min(ticker.deltaMS / 1000, 0.05);

      elapsedTime += deltaTime;

      const remainingTime = Math.max(0, sessionTime - elapsedTime);
      const totalSeconds = Math.ceil(remainingTime);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      timeText.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      if (remainingTime <= 0) {
        endGame();
        return;
      }
      spawnTimer += deltaTime;

      while (spawnTimer >= enemySpawnTime) {
        spawnTimer -= enemySpawnTime;
        void spawnEnemy();
      }
      const left = keys.has("KeyA") || keys.has("ArrowLeft");
      const right = keys.has("KeyD") || keys.has("ArrowRight");
      const forward = keys.has("KeyW") || keys.has("ArrowUp");

      if (left) {
        ship.rotation -= PLAYER_ROTATION_SPEED * deltaTime;
      }

      if (right) {
        ship.rotation += PLAYER_ROTATION_SPEED * deltaTime;
      }

      if (forward) {
        const nextX =
          ship.x + Math.sin(ship.rotation) * PLAYER_SPEED * deltaTime;

        const nextY =
          ship.y - Math.cos(ship.rotation) * PLAYER_SPEED * deltaTime;

        const distanceToIsland = calculateDistance(
          nextX,
          nextY,
          ISLAND_X,
          ISLAND_Y,
        );

        const SHIP_RADIUS = 25;

        const canMove =
          distanceToIsland >= ISLAND_COLLISION_RADIUS + SHIP_RADIUS;

        if (canMove) {
          ship.x = Math.max(25, Math.min(GAME_WIDTH - 25, nextX));
          ship.y = Math.max(25, Math.min(GAME_HEIGHT - 25, nextY));
        }
      }

      if (keys.has("Space")) {
        shoot(0);
      }

      if (keys.has("KeyQ")) {
        shoot(-Math.PI / 2);
      }

      if (keys.has("KeyE")) {
        shoot(Math.PI / 2);
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.type === "chaser") {
          moveEnemy(enemy.sprite, ship, deltaTime);

          enemy.healthBarFrame.position.set(
            enemy.sprite.x,
            enemy.sprite.y - 60,
          );

          enemy.healthBarFill.position.set(
            enemy.sprite.x - 30,
            enemy.sprite.y - 60,
          );
        }

        if (enemy.type === "shooter") {
          const dx = ship.x - enemy.sprite.x;
          const dy = ship.y - enemy.sprite.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const minDistance = 200;
          const maxDistance = 300;
          const shooterSpeed = 80;

          if (distance > 0) {
            const directionX = dx / distance;
            const directionY = dy / distance;
            let moveX = 0;
            let moveY = 0;

            if (distance > maxDistance) {
              moveX = directionX;
              moveY = directionY;
            } else if (distance < minDistance) {
              moveX = -directionX;
              moveY = -directionY;
            }

            if (moveX !== 0 || moveY !== 0) {
              const nextX = enemy.sprite.x + moveX * shooterSpeed * deltaTime;
              const nextY = enemy.sprite.y + moveY * shooterSpeed * deltaTime;

              const distanceToIsland = calculateDistance(
                nextX,
                nextY,
                ISLAND_X,
                ISLAND_Y,
              );

              const ENEMY_SHIP_RADIUS = 25;

              const canMove =
                distanceToIsland >= ISLAND_COLLISION_RADIUS + ENEMY_SHIP_RADIUS;

              if (canMove) {
                enemy.sprite.x = Math.max(
                  ENEMY_SHIP_RADIUS,
                  Math.min(GAME_WIDTH - ENEMY_SHIP_RADIUS, nextX),
                );

                enemy.sprite.y = Math.max(
                  ENEMY_SHIP_RADIUS,
                  Math.min(GAME_HEIGHT - ENEMY_SHIP_RADIUS, nextY),
                );
              } else {
                const dxIsland = nextX - ISLAND_X;
                const dyIsland = nextY - ISLAND_Y;
                const distanceIsland = Math.hypot(dxIsland, dyIsland);

                if (distanceIsland > 0) {
                  const normalX = dxIsland / distanceIsland;
                  const normalY = dyIsland / distanceIsland;

                  const dot = moveX * normalX + moveY * normalY;

                  const slideX = moveX - dot * normalX;
                  const slideY = moveY - dot * normalY;

                  const slideNextX =
                    enemy.sprite.x + slideX * shooterSpeed * deltaTime;
                  const slideNextY =
                    enemy.sprite.y + slideY * shooterSpeed * deltaTime;

                  const slideDistance = calculateDistance(
                    slideNextX,
                    slideNextY,
                    ISLAND_X,
                    ISLAND_Y,
                  );

                  if (
                    slideDistance >=
                    ISLAND_COLLISION_RADIUS + ENEMY_SHIP_RADIUS
                  ) {
                    enemy.sprite.x = Math.max(
                      ENEMY_SHIP_RADIUS,
                      Math.min(GAME_WIDTH - ENEMY_SHIP_RADIUS, slideNextX),
                    );

                    enemy.sprite.y = Math.max(
                      ENEMY_SHIP_RADIUS,
                      Math.min(GAME_HEIGHT - ENEMY_SHIP_RADIUS, slideNextY),
                    );
                  }
                }
              }

              const targetRotation = Math.atan2(moveY, moveX) + Math.PI / 2;

              const angleDifference = Math.atan2(
                Math.sin(targetRotation - enemy.sprite.rotation),
                Math.cos(targetRotation - enemy.sprite.rotation),
              );

              enemy.sprite.rotation +=
                angleDifference * Math.min(1, 3 * deltaTime);
            }
          }

          enemyShoot(enemy);
          enemy.healthBarFrame.x = enemy.sprite.x;
          enemy.healthBarFrame.y = enemy.sprite.y - 60;

          enemy.healthBarFill.x = enemy.sprite.x - 30;
          enemy.healthBarFill.y = enemy.sprite.y - 60;
          enemy.healthBarFrame.position.set(
            enemy.sprite.x,
            enemy.sprite.y - 60,
          );

          enemy.healthBarFill.position.set(
            enemy.sprite.x - 30,
            enemy.sprite.y - 60,
          );
        }

        const distance = calculateDistance(
          ship.x,
          ship.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );

        const currentTime = performance.now();

        if (
          distance < SHIP_COLLISION_RADIUS &&
          currentTime - lastCollisionTime >= COLLISION_COOLDOWN
        ) {
          lastCollisionTime = currentTime;
          createExplosion(
            app,
            (ship.x + enemy.sprite.x) / 2,
            (ship.y + enemy.sprite.y) / 2,
          );
          playerHealth = Math.max(0, playerHealth - COLLISION_DAMAGE);

          updateHealthBar();

          if (enemy.type === "chaser") {
            createDestroyedShipEffect(
              enemy.sprite.x,
              enemy.sprite.y,
              enemy.sprite.rotation,
            );

            app.stage.removeChild(enemy.sprite);
            app.stage.removeChild(enemy.healthBarFrame);
            app.stage.removeChild(enemy.healthBarFill);

            enemy.sprite.destroy();
            enemy.healthBarFrame.destroy();
            enemy.healthBarFill.destroy();

            enemies.splice(i, 1);
          }

          if (playerHealth <= 0) {
            endGame();
            return;
          }
        }
      }

      for (let i = enemyCannonballs.length - 1; i >= 0; i--) {
        const ball = enemyCannonballs[i];

        moveCannonball(ball, deltaTime);
        const distanceToIsland = calculateDistance(
          ball.sprite.x,
          ball.sprite.y,
          ISLAND_X,
          ISLAND_Y,
        );

        const CANNONBALL_RADIUS = 6;

        if (distanceToIsland < ISLAND_COLLISION_RADIUS + CANNONBALL_RADIUS) {
          createExplosion(app, ball.sprite.x, ball.sprite.y);

          destroyCannonball(ball);
          enemyCannonballs.splice(i, 1);

          continue;
        }

        const distance = calculateDistance(
          ball.sprite.x,
          ball.sprite.y,
          ship.x,
          ship.y,
        );

        if (distance < CANNONBALL_HIT_RADIUS) {
          playerHealth = Math.max(0, playerHealth - ENEMY_CANNONBALL_DAMAGE);

          healthFill.style.width = `${(playerHealth / PLAYER_MAX_HEALTH) * 100}%`;

          healthValue.textContent = `${playerHealth} / ${PLAYER_MAX_HEALTH}`;

          healthFill.style.width = `${(playerHealth / PLAYER_MAX_HEALTH) * 100}%`;

          healthValue.textContent = `${playerHealth} / ${PLAYER_MAX_HEALTH}`;
          destroyCannonball(ball);
          enemyCannonballs.splice(i, 1);

          createExplosion(app, ship.x, ship.y);

          if (playerHealth <= 0) {
            endGame();
          }

          continue;
        }

        const outOfBounds =
          ball.sprite.x < 0 ||
          ball.sprite.x > GAME_WIDTH ||
          ball.sprite.y < 0 ||
          ball.sprite.y > GAME_HEIGHT;

        if (ball.lifetime <= 0 || outOfBounds) {
          destroyCannonball(ball);
          enemyCannonballs.splice(i, 1);
        }
      }

      for (let i = cannonballs.length - 1; i >= 0; i--) {
        const ball = cannonballs[i];

        moveCannonball(ball, deltaTime);
        const distanceToIsland = calculateDistance(
          ball.sprite.x,
          ball.sprite.y,
          ISLAND_X,
          ISLAND_Y,
        );

        const CANNONBALL_RADIUS = 6;

        if (distanceToIsland < ISLAND_COLLISION_RADIUS + CANNONBALL_RADIUS) {
          createExplosion(app, ball.sprite.x, ball.sprite.y);

          destroyCannonball(ball);
          cannonballs.splice(i, 1);

          continue;
        }

        let hitEnemy = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];

          const distance = calculateDistance(
            ball.sprite.x,
            ball.sprite.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );

          if (distance < CANNONBALL_HIT_RADIUS) {
            enemy.health -= 1;
            const healthPercentage = Math.max(
              0,
              enemy.health / ENEMY_MAX_HEALTH,
            );
            enemy.healthBarFill.width = 60 * healthPercentage;

            createExplosion(app, enemy.sprite.x, enemy.sprite.y);
            if (enemy.health === 2) {
              enemy.healthBarFill.texture = enemyHealthGreenTexture;
              enemy.healthBarFill.tint = 0xffff00;
            } else if (enemy.health === 1) {
              enemy.healthBarFill.texture = enemyHealthRedTexture;
              enemy.healthBarFill.tint = 0xffffff;
            } else {
              enemy.healthBarFill.texture = enemyHealthGreenTexture;
              enemy.healthBarFill.tint = 0xffffff;
            }
            createExplosion(app, enemy.sprite.x, enemy.sprite.y);

            destroyCannonball(ball);
            cannonballs.splice(i, 1);

            hitEnemy = true;

            if (enemy.health <= 0) {
              createDestroyedShipEffect(
                enemy.sprite.x,
                enemy.sprite.y,
                enemy.sprite.rotation,
              );

              app.stage.removeChild(enemy.sprite);
              enemy.sprite.destroy();

              app.stage.removeChild(enemy.healthBarFrame);
              app.stage.removeChild(enemy.healthBarFill);

              enemy.healthBarFrame.destroy();
              enemy.healthBarFill.destroy();
              enemies.splice(j, 1);

              score += POINTS_PER_ENEMY;
              scoreText.innerText = String(score);
            }

            break;
          }
        }

        if (hitEnemy) {
          continue;
        }

        const outOfBounds =
          ball.sprite.x < 0 ||
          ball.sprite.x > GAME_WIDTH ||
          ball.sprite.y < 0 ||
          ball.sprite.y > GAME_HEIGHT;

        if (ball.lifetime <= 0 || outOfBounds) {
          destroyCannonball(ball);
          cannonballs.splice(i, 1);
        }
      }
    };

    const init = async () => {
      try {
        await app.init({
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: 0x126782,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio, 2),
          autoDensity: true,
        });

        initialized = true;

        if (disposed) {
          return;
        }

        app.canvas.style.width = "100%";
        app.canvas.style.height = "auto";
        app.canvas.style.display = "block";

        container.appendChild(app.canvas);

        const island = await createIsland();

        if (disposed) return;

        const waterTexture = await Assets.load(
          "/assets/png/default/tiles/tile_73.png",
        );

        const water = new TilingSprite({
          texture: waterTexture,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        });

        app.stage.addChildAt(water, 0);

        const rightCoastTexture = await Assets.load(
          "/assets/png/default/tiles/tile_22.png",
        );

        const rightCoast = new TilingSprite({
          texture: rightCoastTexture,
          width: 80,
          height: GAME_HEIGHT,
        });

        rightCoast.position.set(GAME_WIDTH - 20, 0);
        app.stage.addChild(rightCoast);

        const bottomCoastTexture = await Assets.load(
          "/assets/png/default/tiles/tile_7.png",
        );

        const bottomCoast = new TilingSprite({
          texture: bottomCoastTexture,
          width: GAME_WIDTH,
          height: 20,
        });

        bottomCoast.position.set(0, GAME_HEIGHT - 10);
        app.stage.addChild(bottomCoast);

        app.stage.addChild(island);

        const shipTexture = await Assets.load(
          "/assets/png/default/ships/ship_1.png",
        );

        enemyHealthFrameTexture = await Assets.load(
          "/assets/png/default/ui/hud/enemy_health_frame.png",
        );

        enemyHealthGreenTexture = await Assets.load(
          "/assets/png/default/ui/hud/enemy_health_fill_green.png",
        );

        enemyHealthRedTexture = await Assets.load(
          "/assets/png/default/ui/hud/enemy_health_fill_red.png",
        );

        const yellowBar = new Graphics().rect(0, 0, 60, 8).fill(0xffd700);

        yellowBar.destroy();
        fireTexture1 = await Assets.load(
          "/assets/png/default/effects/fire_1.png",
        );

        fireTexture2 = await Assets.load(
          "/assets/png/default/effects/fire_2.png",
        );

        destroyedShipTexture = await Assets.load(
          "/assets/png/default/ships/ship_20.png",
        );
        destroyedSailTexture = await Assets.load(
          "/assets/png/default/ship_parts/sail_large_14.png",
        );

        await Promise.all([
          Assets.load("/assets/png/default/effects/explosion_3.png"),
          Assets.load("/assets/png/default/effects/explosion_2.png"),
          Assets.load("/assets/png/default/effects/explosion_1.png"),
        ]);

        if (disposed) {
          app.destroy(true);
          return;
        }

        ship = new Sprite(shipTexture);

        ship.anchor.set(0.5);
        ship.position.set(400, 300);

        ship.width = 65;
        ship.height = 85;
        ship.scale.y *= -1;

        app.stage.addChild(ship);
        playerHealthBarFrame = new Sprite(enemyHealthFrameTexture);
        playerHealthBarFrame.anchor.set(0.5);
        playerHealthBarFrame.width = 70;
        playerHealthBarFrame.height = 14;
        playerHealthBarFrame.position.set(ship.x, ship.y - 65);

        playerHealthBarFill = new Sprite(enemyHealthGreenTexture);
        playerHealthBarFill.anchor.set(0, 0.5);
        playerHealthBarFill.width = 60;
        playerHealthBarFill.height = 8;
        playerHealthBarFill.position.set(ship.x - 30, ship.y - 65);

        app.stage.addChild(playerHealthBarFrame);
        app.stage.addChild(playerHealthBarFill);
        await spawnEnemy();

        if (disposed) return;

        app.ticker.add(update);
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    void init();

    return () => {
      disposed = true;
      keys.clear();

      timePanel.remove();
      pauseButton.remove();
      healthText.remove();

      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);

      if (initialized) {
        app.destroy(true);
      }
    };
  }, [onRestart, sessionTime, enemySpawnTime]);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#071c2c",
        color: "#ffffff",
        textAlign: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1>Pirate Battle</h1>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "20px auto",
          border: "3px solid #d4a64a",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* TELA DE PAUSA */}
        {isPauseMenuOpen && gameResult === null && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 100,
              background: "rgba(0, 10, 20, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "80%",
                maxWidth: "430px",
                padding: "55px 35px",
                boxSizing: "border-box",
                backgroundImage:
                  'url("/assets/png/default/ui/menu/panel_menu.png")',
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                textAlign: "center",
              }}
            >
              <h2 style={{ color: "#ffe3a4", fontSize: "32px" }}>
                GAME PAUSED
              </h2>

              <button
                style={pauseMenuButtonStyle}
                onClick={() => resumeGameRef.current()}
              >
                CONTINUE
              </button>

              <button style={pauseMenuButtonStyle} onClick={onMainMenu}>
                MAIN MENU
              </button>
            </div>
          </div>
        )}

        {/* TELA DE GAME OVER */}
        {gameResult !== null && (
          <GameOverScreen
            score={gameResult.score}
            elapsedTime={gameResult.elapsedTime}
            onRestart={onRestart}
            onMainMenu={onMainMenu}
          />
        )}
      </div>
    </div>
  );
}

const pauseMenuButtonStyle: React.CSSProperties = {
  display: "block",
  width: "230px",
  height: "60px",
  margin: "15px auto",
  border: "none",
  backgroundColor: "transparent",
  backgroundImage:
    'url("/assets/png/default/ui/menu/button_primary_normal.png")',
  backgroundSize: "100% 100%",
  color: "#30271e",
  fontSize: "20px",
  fontWeight: "bold",
  cursor: "pointer",
};
