import type { IConfig } from "../types";

export function getConfig(): IConfig {
  return {
    PORT: Number(process.env.PORT),
    TILE_SIZE: Number(process.env.TILE_SIZE),
    TILES_PATH: process.env.TILES_PATH!,
    NODE_ENV: process.env.NODE_ENV,
  };
}
