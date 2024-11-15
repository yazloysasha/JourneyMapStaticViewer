import fs from "fs";
import sharp from "sharp";
import { getConfig } from "../shared/utils";
import { TILE_SIZE } from "../shared/consts";
import { IManifest, ITile } from "../shared/types";

export async function getManifestOrUpdateTiles(): Promise<IManifest> {
  const manifestPath = "./public/tiles/manifest.json";

  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  const manifest = await updateTiles();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest));

  return manifest;
}

async function updateTiles(): Promise<IManifest> {
  const config = getConfig();

  const originalTiles: ITile[] = fs
    .readdirSync(config.TILES_PATH)
    .filter(
      (file) =>
        file.endsWith(".png") &&
        fs.statSync(`${config.TILES_PATH}/${file}`).size
    )
    .map((file) => {
      const [x, z] = file.split(".")[0].split(",").map(Number);

      return { x, z };
    });

  if (!originalTiles.length) {
    return {
      sizes: { width: 0, height: 0 },
      indent: { x: 0, z: 0 },
      tiles: {},
    };
  }

  if (fs.existsSync("./public/tiles")) {
    fs.rmSync("./public/tiles", { recursive: true });
  }
  fs.mkdirSync("./public/tiles/1", { recursive: true });

  let minX: number;
  let minZ: number;
  let maxX: number;
  let maxZ: number;

  originalTiles.forEach(({ x, z }) => {
    if (minX === undefined || x < minX) minX = x;
    if (minZ === undefined || z < minZ) minZ = z;
    if (maxX === undefined || x > maxX) maxX = x;
    if (maxZ === undefined || z > maxZ) maxZ = z;

    const file = `/${x},${z}.png`;

    fs.copyFileSync(config.TILES_PATH + file, `./public/tiles/1/${file}`);
  });

  const tiles = await generateTiles(originalTiles, 1);

  return {
    sizes: {
      width: (maxX! - minX! + 1) * TILE_SIZE,
      height: (maxZ! - minZ! + 1) * TILE_SIZE,
    },
    indent: {
      x: -minX! * TILE_SIZE,
      z: -minZ! * TILE_SIZE,
    },
    tiles,
  };
}

async function generateTiles(
  originalTiles: ITile[],
  originalY: number = 1
): Promise<{ [y: number]: ITile[] }> {
  if (originalY >= 8) return {};

  const tiles: { [y: number]: ITile[] } = {};
  const layer: ITile[] = [];
  const y = originalY + 1;

  const runningTiles = originalTiles.map((tile) => ({ ...tile, ready: false }));

  for (const originalTile of runningTiles) {
    if (originalTile.ready) continue;

    const x = Math.floor(originalTile.x / 2);
    const z = Math.floor(originalTile.z / 2);

    const startX = x * 2;
    const startZ = z * 2;
    const endX = startX + 2;
    const endZ = startZ + 2;

    const images: sharp.OverlayOptions[] = [];

    for (const candidateTile of runningTiles) {
      if (candidateTile.ready) continue;
      if (startX > candidateTile.x) continue;
      if (candidateTile.x >= endX) continue;
      if (startZ > candidateTile.z) continue;
      if (candidateTile.z >= endZ) continue;

      const imagePath = `./public/tiles/${originalY}/${candidateTile.x},${candidateTile.z}.png`;

      images.push({
        input: imagePath,
        top: (candidateTile.z - startZ) * TILE_SIZE,
        left: (candidateTile.x - startX) * TILE_SIZE,
        failOn: "none",
      });

      candidateTile.ready = true;

      if (images.length >= 4) break;
    }

    if (!fs.existsSync(`./public/tiles/${y}`)) {
      fs.mkdirSync(`./public/tiles/${y}`);
    }

    while (true) {
      try {
        const buffer = await sharp({
          create: {
            width: TILE_SIZE * 2,
            height: TILE_SIZE * 2,
            channels: 4,
            background: "transparent",
          },
        })
          .png()
          .composite(images)
          .toBuffer();

        await sharp(buffer)
          .resize(TILE_SIZE)
          .toFile(`./public/tiles/${y}/${x},${z}.png`);

        break;
      } catch (error) {
        console.error(error);
      }
    }

    layer.push({ x, z });
  }

  if (layer.length) {
    tiles[y] = layer;

    const nextTiles = await generateTiles(layer, y);
    for (const nextY in nextTiles) {
      tiles[nextY] = nextTiles[nextY];
    }
  }

  return tiles;
}
