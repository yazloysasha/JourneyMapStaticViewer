export interface IConfig {
  PORT: number;
  TITLE: string;
  WORLD_NAME: string;
  TILES_PATH: string;
  TOWNY_PATH?: string;
  NODE_ENV: "development" | "production" | "test";
}
