export interface IConfig {
  PORT: number;
  CHUNK_SIZE: number;
  TILES_PATH: string;
  NODE_ENV: "development" | "production" | "test";
}
