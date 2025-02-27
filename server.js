const fs = require("fs");
const next = require("next");
const { parse } = require("url");
const { createServer } = require("http");

/**
 * @typedef {import('./shared/types').IConfig} IConfig
 */

const envPath = "./.env";
const envExamplePath = "./.env.example";

/**
 * Get project configuration
 * @returns {IConfig}
 */
function getConfig() {
  return {
    PORT: Number(process.env.PORT),
    TITLE: process.env.TITLE,
    WORLD_NAME: process.env.WORLD_NAME,
    TILES_PATH: process.env.TILES_PATH,
    TOWNY_PATH: process.env.TOWNY_PATH,
    NODE_ENV: process.env.NODE_ENV,
  };
}

/**
 * Create configuration in file
 */
function createConfig() {
  fs.copyFileSync(envExamplePath, envPath);
}

/**
 * Improved server startup
 */
async function start() {
  if (!fs.existsSync(envPath)) createConfig();

  require("dotenv").config();

  const config = getConfig();

  fs.mkdirSync(config.TILES_PATH, { recursive: true });

  const app = next({ dev: config.NODE_ENV !== "production" });
  const requestHandler = app.getRequestHandler();

  await app.prepare();

  const server = createServer((req, res) => {
    requestHandler(req, res, parse(req.url, true));
  });

  server.listen(config.PORT);

  console.log(
    `Server listening at http://localhost:${config.PORT} as ${config.NODE_ENV}`
  );
}

start();
