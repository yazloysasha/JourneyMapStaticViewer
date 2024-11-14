import fs from "fs";
import { getConfig } from "../../shared/utils";
import { IManifest, ITile } from "../../shared/types";

export async function checkOrUpdateTiles(): Promise<IManifest> {
  const config = getConfig();

  const originalTiles: ITile[] = fs
    .readdirSync(config.TILES_PATH)
    .map((file) => {
      const [x, z] = file.split(".")[0].split(",").map(Number);

      return { y: 1, x, z };
    });

  if (!originalTiles.length) {
    return {
      tileSize: 0,
      sizes: { width: 0, height: 0 },
      indent: { x: 0, z: 0 },
      tiles: [],
    };
  }

  /**
   * TODO: finish cutting tiles
   */
  const tiles: ITile[] = originalTiles;

  let minX: number;
  let minZ: number;
  let maxX: number;
  let maxZ: number;

  tiles.forEach(({ x, z }) => {
    if (minX === undefined || x < minX) minX = x;
    if (minZ === undefined || z < minZ) minZ = z;
    if (maxX === undefined || x > maxX) maxX = x;
    if (maxZ === undefined || z > maxZ) maxZ = z;
  });

  return {
    tileSize: config.TILE_SIZE,
    sizes: {
      width: (maxX! - minX! + 1) * config.TILE_SIZE,
      height: (maxZ! - minZ! + 1) * config.TILE_SIZE,
    },
    indent: {
      x: -minX! * config.TILE_SIZE,
      z: -minZ! * config.TILE_SIZE,
    },
    tiles,
  };
}
