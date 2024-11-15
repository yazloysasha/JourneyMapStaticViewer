import { Tile } from "./tile";

export interface IManifest {
  sizes: {
    width: number;
    height: number;
  };
  indent: {
    x: number;
    z: number;
  };
  tiles: Tile[][];
}
