import { Assets, Sprite } from "pixi.js";

import {
  ENEMY_SPEED,
  ENEMY_ROTATION_SPEED,
  ENEMY_STOP_DISTANCE,
} from "./constants";

import { ISLAND_X, ISLAND_Y, ISLAND_COLLISION_RADIUS } from "./island";
const enemyAvoidance = new WeakMap<
  Sprite,
  { side: number; avoiding: boolean }
>();

export function moveEnemy(
  enemyShip: Sprite,
  playerShip: Sprite,
  deltaTime: number,
): void {
  const dx = playerShip.x - enemyShip.x;
  const dy = playerShip.y - enemyShip.y;
  const distance = Math.hypot(dx, dy);

  const collisionRadius = ISLAND_COLLISION_RADIUS + 25;
  const safeRadius = collisionRadius + 35;

  const islandDX = enemyShip.x - ISLAND_X;
  const islandDY = enemyShip.y - ISLAND_Y;
  const islandDistance = Math.hypot(islandDX, islandDY);

  const directionX = dx / Math.max(distance, 1);
  const directionY = dy / Math.max(distance, 1);

  const projection =
    (ISLAND_X - enemyShip.x) * directionX +
    (ISLAND_Y - enemyShip.y) * directionY;

  const closestDistance = Math.hypot(
    enemyShip.x +
      directionX * Math.max(0, Math.min(distance, projection)) -
      ISLAND_X,
    enemyShip.y +
      directionY * Math.max(0, Math.min(distance, projection)) -
      ISLAND_Y,
  );

  const islandBlocksPath =
    projection > 0 && projection < distance && closestDistance < safeRadius;

  let avoidance = enemyAvoidance.get(enemyShip);

  if (!avoidance) {
    avoidance = { side: 1, avoiding: false };
    enemyAvoidance.set(enemyShip, avoidance);
  }

  if (!avoidance.avoiding && islandBlocksPath) {
    const cross = islandDX * dy - islandDY * dx;
    avoidance.side = cross >= 0 ? 1 : -1;
    avoidance.avoiding = true;
  }

  if (avoidance.avoiding && !islandBlocksPath) {
    avoidance.avoiding = false;
  }

  let targetX = dx;
  let targetY = dy;

  if (avoidance.avoiding) {
    const normalX = islandDX / Math.max(islandDistance, 1);
    const normalY = islandDY / Math.max(islandDistance, 1);

    const tangentX = -normalY * avoidance.side;
    const tangentY = normalX * avoidance.side;

    const correction = Math.max(
      -0.2,
      Math.min(2, (safeRadius - islandDistance) / 15),
    );

    targetX = tangentX + normalX * correction;
    targetY = tangentY + normalY * correction;
  }

  const targetAngle = Math.atan2(targetX, -targetY);

  const angleDifference = Math.atan2(
    Math.sin(targetAngle - enemyShip.rotation),
    Math.cos(targetAngle - enemyShip.rotation),
  );

  const maxRotation = ENEMY_ROTATION_SPEED * deltaTime;

  enemyShip.rotation += Math.max(
    -maxRotation,
    Math.min(maxRotation, angleDifference),
  );

  if (distance <= ENEMY_STOP_DISTANCE) return;

  const nextX =
    enemyShip.x + Math.sin(enemyShip.rotation) * ENEMY_SPEED * deltaTime;

  const nextY =
    enemyShip.y - Math.cos(enemyShip.rotation) * ENEMY_SPEED * deltaTime;

  const nextIslandDistance = Math.hypot(nextX - ISLAND_X, nextY - ISLAND_Y);

  if (nextIslandDistance >= collisionRadius) {
    enemyShip.position.set(nextX, nextY);
  } else {
    const normalX = islandDX / Math.max(islandDistance, 1);
    const normalY = islandDY / Math.max(islandDistance, 1);

    const movementX = nextX - enemyShip.x;
    const movementY = nextY - enemyShip.y;

    const inwardMovement = Math.min(
      0,
      movementX * normalX + movementY * normalY,
    );

    const slideX = enemyShip.x + movementX - inwardMovement * normalX;

    const slideY = enemyShip.y + movementY - inwardMovement * normalY;

    const slideDistance = Math.hypot(slideX - ISLAND_X, slideY - ISLAND_Y);

    if (slideDistance >= collisionRadius - 0.01) {
      enemyShip.position.set(slideX, slideY);
    }
  }
}

export async function createEnemy(
  playerX: number,
  playerY: number,
): Promise<Sprite> {
  const enemyTexture = await Assets.load(
    "/assets/png/default/ships/ship_2.png",
  );

  const enemyShip = new Sprite(enemyTexture);

  enemyShip.anchor.set(0.5);
  enemyShip.width = 65;
  enemyShip.height = 85;
  enemyShip.scale.y *= -1;

  const MIN_SPAWN_DISTANCE = 200;
  const ENEMY_COLLISION_RADIUS = 25;

  let spawnX = 0;
  let spawnY = 0;

  let distanceToPlayer = 0;
  let distanceToIsland = 0;

  do {
    spawnX = 80 + Math.random() * 640;
    spawnY = 80 + Math.random() * 440;

    distanceToPlayer = Math.hypot(spawnX - playerX, spawnY - playerY);

    distanceToIsland = Math.hypot(spawnX - ISLAND_X, spawnY - ISLAND_Y);
  } while (
    distanceToPlayer < MIN_SPAWN_DISTANCE ||
    distanceToIsland < ISLAND_COLLISION_RADIUS + ENEMY_COLLISION_RADIUS
  );

  enemyShip.position.set(spawnX, spawnY);

  return enemyShip;
}
