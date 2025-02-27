import fs from "fs";
import { ITown } from "../shared/types";
import { getConfig } from "../shared/utils";

export function getTowns(): ITown[] {
  const config = getConfig();

  const towns: ITown[] = [];

  if (!config.TOWNY_PATH) return towns;

  const townFileNames = fs.readdirSync(`${config.TOWNY_PATH}/towns`);

  townFileNames.forEach((fileName) => {
    if (!fileName.endsWith(".txt")) return;

    const content = fs.readFileSync(
      `${config.TOWNY_PATH}/towns/${fileName}`,
      "utf8"
    );
    const lines = content.split("\n");

    let name: string | undefined;
    let mayor: string | undefined;

    for (const line of lines) {
      const [key, value] = line.split("=");
      if (!key || !value) continue;

      switch (key) {
        case "name":
          name = value;
          break;

        case "mayor":
          mayor = value;
          break;
      }

      if (name && mayor) break;
    }

    if (!name || !mayor) return;

    towns.push({ name, mayor, chunks: [] });
  });

  const chunkFileNames = fs.readdirSync(
    `${config.TOWNY_PATH}/townblocks/${config.WORLD_NAME}`
  );

  chunkFileNames.forEach((fileName) => {
    if (!fileName.endsWith(".data")) return;

    const [x, z] = fileName.split(".")[0].split("_").map(Number);

    const content = fs.readFileSync(
      `${config.TOWNY_PATH}/townblocks/${config.WORLD_NAME}/${fileName}`,
      "utf8"
    );
    const lines = content.split("\n");

    let townName: string | undefined;

    for (const line of lines) {
      const [key, value] = line.split("=");
      if (!key || !value) continue;

      switch (key) {
        case "town":
          townName = value;
          break;
      }

      if (townName) break;
    }

    if (!townName) return;

    const town = towns.find(({ name }) => name === townName);
    if (!town) return;

    town.chunks.push([x, z]);
  });

  return towns;
}
