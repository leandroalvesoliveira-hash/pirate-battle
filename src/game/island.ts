import { Assets, Container, Sprite } from "pixi.js";

export const ISLAND_X = 400;
export const ISLAND_Y = 150;
export const ISLAND_COLLISION_RADIUS = 75;

const TILE_SIZE = 32;

const ISLAND_TILES = [
  [10, 11, 11, 11, 12],
  [26, 1, 2, 3, 28],
  [26, 22, 39, 41, 28],
  [26, 54, 56, 57, 28],
  [42, 43, 43, 43, 44],
];

export async function createIsland(): Promise<Container> {
  const island = new Container();

  const textures = await Promise.all(
    [...new Set(ISLAND_TILES.flat())].map(async (tileNumber) => {
      const texture = await Assets.load(
        `/assets/png/default/tiles/tile_${tileNumber}.png`,
      );

      return [tileNumber, texture] as const;
    }),
  );

  const textureMap = new Map(textures);

  ISLAND_TILES.forEach((row, rowIndex) => {
    row.forEach((tileNumber, columnIndex) => {
      const texture = textureMap.get(tileNumber);

      if (!texture) return;

      const tile = new Sprite(texture);

      tile.width = TILE_SIZE;
      tile.height = TILE_SIZE;

      tile.x = columnIndex * TILE_SIZE;
      tile.y = rowIndex * TILE_SIZE;

      island.addChild(tile);
    });
  });

  island.pivot.set(
    (ISLAND_TILES[0].length * TILE_SIZE) / 2,
    (ISLAND_TILES.length * TILE_SIZE) / 2,
  );

  island.position.set(ISLAND_X, ISLAND_Y);
  console.log("NOVA ILHA CARREGADA!", island.children.length);

  return island;
}