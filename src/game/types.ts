import type { Graphics } from "pixi.js";

export type Cannonball = {
  sprite: Graphics;
  vx: number;
  vy: number;
  lifetime: number;
};