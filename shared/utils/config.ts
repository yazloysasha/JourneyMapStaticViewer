import type { IConfig } from "../types";

export function getConfig(): IConfig {
  return {
    PORT: Number(process.env.PORT),
    GENERATE_TILES: process.env.GENERATE_TILES !== "0",
    TILES_PATH: process.env.TILES_PATH!,
    NODE_ENV: process.env.NODE_ENV,
  };
}
