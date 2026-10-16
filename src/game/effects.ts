import { Application, Assets, Sprite, type Ticker } from "pixi.js";

export function createExplosion(app: Application, x: number, y: number): void {
  const texture1 = Assets.get("/assets/png/default/effects/explosion_1.png");
  const texture2 = Assets.get("/assets/png/default/effects/explosion_2.png");
  const texture3 = Assets.get("/assets/png/default/effects/explosion_3.png");

  console.log("Texturas da explosão:", {
    explosion1: texture1?.source?.uid,
    explosion2: texture2?.source?.uid,
    explosion3: texture3?.source?.uid,
    mesmaTextura12: texture1 === texture2,
    mesmaTextura23: texture2 === texture3,
  });
  const explosion = new Sprite(texture1);

  explosion.anchor.set(0.5);
  explosion.position.set(x, y);
  explosion.scale.set(1);

  app.stage.addChild(explosion);

  let elapsed = 0;
  let currentFrame = 1;

  const animateExplosion = (ticker: Ticker) => {
    elapsed += ticker.deltaMS;

    if (elapsed >= 500) {
      app.ticker.remove(animateExplosion);
      explosion.destroy();
      return;
    }

    if (elapsed >= 250 && currentFrame !== 3) {
      explosion.texture = texture3;
      currentFrame = 3;
    }
    else if (elapsed >= 100 && elapsed < 250 && currentFrame !== 2) {
      explosion.texture = texture2;
      currentFrame = 2;
    }
  };

  app.ticker.add(animateExplosion);
}
