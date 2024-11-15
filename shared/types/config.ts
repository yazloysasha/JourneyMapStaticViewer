export interface IConfig {
  PORT: number;
  TITLE: string;
  TILES_PATH: string;
  NODE_ENV: "development" | "production" | "test";
}
