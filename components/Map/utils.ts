import { IManifest } from "../../shared/types";

export function getWindowCoordinates(
  scale: number,
  positionX: number,
  positionZ: number,
  manifest: IManifest
): {
  startPointX: number;
  startPointZ: number;
  endPointX: number;
  endPointZ: number;
} {
  const startPointX = -(positionX / scale + manifest.indent.x);
  const startPointZ = -(positionZ / scale + manifest.indent.z);

  const endPointX = startPointX + window.innerWidth / scale;
  const endPointZ = startPointZ + window.innerHeight / scale;

  return {
    startPointX,
    startPointZ,
    endPointX,
    endPointZ,
  };
}
