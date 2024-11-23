import fs from "fs";
import sharp from "sharp";
import { getConfig } from "../shared/utils";
import { TILE_SIZE } from "../shared/consts";
import { IManifest, Tile } from "../shared/types";

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

  const originalTiles: Tile[] = fs
    .readdirSync(config.TILES_PATH)
    .filter(
      (file) =>
        file.endsWith(".png") &&
        fs.statSync(`${config.TILES_PATH}/${file}`).size
    )
    .map((file) => {
      const [x, z] = file.split(".")[0].split(",").map(Number);

      return [x, z];
    });

  if (!originalTiles.length) {
    return {
      sizes: { width: 0, height: 0 },
      indent: { x: 0, z: 0 },
      tiles: [],
      time: 0,
    };
  }

  if (fs.existsSync("./public/tiles")) {
    fs.rmSync("./public/tiles", { recursive: true });
  }
  fs.mkdirSync("./public/tiles/0", { recursive: true });

  let minX: number;
  let minZ: number;
  let maxX: number;
  let maxZ: number;

  originalTiles.forEach(([x, z]) => {
    if (minX === undefined || x < minX) minX = x;
    if (minZ === undefined || z < minZ) minZ = z;
    if (maxX === undefined || x > maxX) maxX = x;
    if (maxZ === undefined || z > maxZ) maxZ = z;

    const file = `/${x},${z}.png`;

    fs.copyFileSync(config.TILES_PATH + file, `./public/tiles/0/${file}`);
  });

  const tiles = await generateTiles(originalTiles, 0);

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
    time: Date.now(),
  };
}

async function generateTiles(
  originalTiles: Tile[],
  originalY: number = 1
): Promise<Tile[][]> {
  const tiles: Tile[][] = [originalTiles];
  if (originalY > 6) return tiles;

  const layer: Tile[] = [];
  const y = originalY + 1;

  const runningTiles: [number, number, boolean][] = originalTiles.map(
    (tile) => [...tile, false]
  );

  for (const originalTile of runningTiles) {
    if (originalTile[2]) continue;

    const x = Math.floor(originalTile[0] / 2);
    const z = Math.floor(originalTile[1] / 2);

    const startX = x * 2;
    const startZ = z * 2;
    const endX = startX + 2;
    const endZ = startZ + 2;

    const images: sharp.OverlayOptions[] = [];

    for (const candidateTile of runningTiles) {
      if (candidateTile[2]) continue;
      if (startX > candidateTile[0]) continue;
      if (candidateTile[0] >= endX) continue;
      if (startZ > candidateTile[1]) continue;
      if (candidateTile[1] >= endZ) continue;

      const imagePath = `./public/tiles/${originalY}/${candidateTile[0]},${candidateTile[1]}.png`;

      images.push({
        input: imagePath,
        top: (candidateTile[1] - startZ) * TILE_SIZE,
        left: (candidateTile[0] - startX) * TILE_SIZE,
        failOn: "none",
      });

      candidateTile[2] = true;

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

    layer.push([x, z]);
  }

  if (layer.length) {
    const nextTiles = await generateTiles(layer, y);

    tiles.push(...nextTiles);
  }

  return tiles;
}
