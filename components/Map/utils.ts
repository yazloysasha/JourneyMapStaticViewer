import { ITile } from "./types";

export function getMapSizes(tiles: ITile[]): {
  sizes: {
    width: number;
    height: number;
  };
  indent: {
    x: number;
    z: number;
  };
} {
  if (!tiles.length) {
    return {
      sizes: { width: 0, height: 0 },
      indent: { x: 0, z: 0 },
    };
  }

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
    sizes: {
      width: (maxX! - minX! + 1) * 512,
      height: (maxZ! - minZ! + 1) * 512,
    },
    indent: {
      x: -minX! * 512,
      z: -minZ! * 512,
    },
  };
}
