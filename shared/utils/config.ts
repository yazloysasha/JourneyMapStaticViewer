import type { IConfig } from "../types";

export function getConfig(): IConfig {
  return {
    PORT: Number(process.env.PORT),
    CHUNK_SIZE: Number(process.env.CHUNK_SIZE),
    TILES_PATH: process.env.TILES_PATH!,
    NODE_ENV: process.env.NODE_ENV,
  };
}
