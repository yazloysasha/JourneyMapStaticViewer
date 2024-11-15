import { ITile } from "./tile";

export interface IManifest {
  sizes: {
    width: number;
    height: number;
  };
  indent: {
    x: number;
    z: number;
  };
  tiles: {
    [y: number]: ITile[];
  };
}
