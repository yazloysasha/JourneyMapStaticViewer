import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import styles from "./styles.module.scss";
import { getWindowCoordinates } from "./utils";
import { useState, type ReactNode } from "react";
import type { IManifest, Tile } from "../../shared/types";
import { TILE_SIZE, RECOMMENDED_TILES_COUNT } from "../../shared/consts";

export default function Map({ manifest }: { manifest: IManifest }): ReactNode {
  const [shownTiles, setShownTiles] = useState<Tile[][]>(
    new Array(manifest.tiles.length).fill([])
  );
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);

  const updateCoordinates = (
    scale: number,
    positionX: number,
    positionZ: number
  ): void => {
    const { startPointX, startPointZ, endPointX, endPointZ } =
      getWindowCoordinates(scale, positionX, positionZ, manifest);

    const x = Math.round(startPointX + (endPointX - startPointX) / 2);
    const z = Math.round(startPointZ + (endPointZ - startPointZ) / 2);

    setCoordinates([x, z]);
  };

  const updateTiles = (
    scale: number,
    positionX: number,
    positionZ: number
  ): void => {
    let { startPointX, startPointZ, endPointX, endPointZ } =
      getWindowCoordinates(scale, positionX, positionZ, manifest);

    let deltaX = endPointX - startPointX;
    let deltaZ = endPointZ - startPointZ;

    const area = deltaX * deltaZ;
    const side = Math.sqrt(area / RECOMMENDED_TILES_COUNT);
    const approximation = Math.log(side / TILE_SIZE) / Math.log(2);
    const pointY = Math.max(0, Math.min(7, Math.round(approximation)));

    const size = TILE_SIZE * Math.pow(2, pointY);

    deltaX -= size;
    deltaZ -= size;

    if (deltaX < size) {
      const halfX = (size - deltaX) / 2;

      startPointX -= halfX;
      endPointX += halfX;
    }
    if (deltaZ < size) {
      const halfZ = (size - deltaZ) / 2;

      startPointZ -= halfZ;
      endPointZ += halfZ;
    }

    const layerFilter = (y: number, x: number, z: number): boolean => {
      const size = TILE_SIZE * Math.pow(2, y);

      const startX = x * size;
      const startZ = z * size;
      const endX = startX + size;
      const endZ = startZ + size;

      return (
        (startPointX <= startX &&
          startX <= endPointX &&
          startPointZ <= startZ &&
          startZ <= endPointZ) ||
        (startPointX <= startX &&
          startX <= endPointX &&
          startPointZ <= endZ &&
          endZ <= endPointZ) ||
        (startPointX <= endX &&
          endX <= endPointX &&
          startPointZ <= startZ &&
          startZ <= endPointZ) ||
        (startPointX <= endX &&
          endX <= endPointX &&
          startPointZ <= endZ &&
          endZ <= endPointZ)
      );
    };

    const newShownTiles: Tile[][] = manifest.tiles.map((layer, y) =>
      y === pointY
        ? layer.filter(([x, z]) => layerFilter(y, x, z))
        : shownTiles[y].length
        ? shownTiles[y].filter(([x, z]) => layerFilter(y, x, z))
        : []
    );

    setShownTiles(newShownTiles);
  };

  const deferredUpdate = (event: ReactZoomPanPinchRef): void => {
    const { scale, positionX, positionY } = event.state;

    updateCoordinates(scale, positionX, positionY);

    const id = String(Math.random() * Date.now());

    localStorage.setItem("id", id);

    setTimeout(() => {
      const savedId = localStorage.getItem("id");
      if (id !== savedId) return;

      updateTiles(scale, positionX, positionY);
    }, 200);
  };

  return (
    <>
      <TransformWrapper
        initialScale={0.5}
        minScale={0.015}
        maxScale={2}
        centerOnInit
        wheel={{ smoothStep: 0.0006 }}
        onZoom={deferredUpdate}
        onPanning={deferredUpdate}
        onInit={deferredUpdate}
      >
        <TransformComponent>
          <div className={styles.map} style={manifest.sizes}>
            {shownTiles.map((layer, y) => {
              const scale = y + 1;
              const size = TILE_SIZE * Math.pow(2, y);

              return layer.map(([x, z]) => (
                <Image
                  key={`${y},${x},${z}`}
                  src={`/tiles/${y}/${x},${z}.png?t=${manifest.time}`}
                  alt={`${x}, ${z}`}
                  width={size + scale * 4}
                  height={size + scale * 4}
                  style={{
                    left: manifest.indent.x + x * size - scale * 2,
                    top: manifest.indent.z + z * size - scale * 2,
                    zIndex: 8 - y,
                  }}
                  onLoad={() => {
                    // TODO: Add remove images when hidden by other images
                  }}
                />
              ));
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <div className={styles.coordinates}>
        <div className={styles.cell}>x: {coordinates[0]}</div>
        <div className={styles.cell}>z: {coordinates[1]}</div>
      </div>
    </>
  );
}
