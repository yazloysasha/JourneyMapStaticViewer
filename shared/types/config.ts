export interface IConfig {
  PORT: number;
  TILE_SIZE: number;
  TILES_PATH: string;
  NODE_ENV: "development" | "production" | "test";
}
