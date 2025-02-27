import type { IConfig } from "../types";

export function getConfig(): IConfig {
  return {
    PORT: Number(process.env.PORT),
    TITLE: process.env.TITLE!,
    WORLD_NAME: process.env.WORLD_NAME!,
    TILES_PATH: process.env.TILES_PATH!,
    TOWNY_PATH: process.env.TOWNY_PATH,
    NODE_ENV: process.env.NODE_ENV,
  };
}
