export interface IConfig {
  PORT: number;
  GENERATE_TILES: boolean;
  TILES_PATH: string;
  NODE_ENV: "development" | "production" | "test";
}
