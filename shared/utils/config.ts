import type { IConfig } from "../types";

export function getConfig(): IConfig {
  return {
    PORT: Number(process.env.PORT),
    TILES_PATH: process.env.TILES_PATH!,
    NODE_ENV: process.env.NODE_ENV,
  };
}
