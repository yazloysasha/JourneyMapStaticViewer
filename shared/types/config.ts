export interface IConfig {
  PORT: number;
  CHUNK_SIZE: number;
  NODE_ENV: "development" | "production" | "test";
}
