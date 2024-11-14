import { ITile } from "./tile";

export interface IManifest {
  tileSize: number;
  sizes: {
    width: number;
    height: number;
  };
  indent: {
    x: number;
    z: number;
  };
  tiles: ITile[];
}
