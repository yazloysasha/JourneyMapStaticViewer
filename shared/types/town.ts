import { Tile } from "./tile";

export interface ITown {
  name: string;
  mayor: string;
  chunks: Tile[];
}
