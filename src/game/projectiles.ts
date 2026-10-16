import { Application, Graphics } from "pixi.js";
import type { Cannonball } from "./types";

export function createCannonball(
  app: Application,
  x: number,
  y: number,
  vx: number,
  vy: number,
  color: number,
  lifetime: number
): Cannonball {
  const sprite = new Graphics()
    .circle(0, 0, 6)
    .fill(color);

  sprite.position.set(x, y);
  app.stage.addChild(sprite);

  return {
    sprite,
    vx,
    vy,
    lifetime,
  };
}

export function moveCannonball(
  cannonball: Cannonball,
  deltaTime: number
): void {
  cannonball.sprite.x += cannonball.vx * deltaTime;
  cannonball.sprite.y += cannonball.vy * deltaTime;

  cannonball.lifetime -= deltaTime;
}

export function destroyCannonball(
  cannonball: Cannonball
): void {
  if (cannonball.sprite.destroyed) return;

  cannonball.sprite.removeFromParent();
  cannonball.sprite.destroy();
}