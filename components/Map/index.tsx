import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import styles from "./styles.module.scss";
import { TILE_SIZE } from "../../shared/consts";
import { useState, type ReactNode } from "react";
import type { IManifest, Tile } from "../../shared/types";

export default function Map({ manifest }: { manifest: IManifest }): ReactNode {
  const [shownTiles, setShownTiles] = useState<Tile[][]>(
    new Array(manifest.tiles.length).fill([])
  );

  const update = (
    scale: number,
    positionX: number,
    positionZ: number
  ): void => {
    const positionY =
      Math.min(8, Math.max(1, Math.round(Math.sqrt(0.8 / scale)))) - 1;

    const size = TILE_SIZE * Math.pow(2, positionY);

    positionX /= scale;
    positionZ /= scale;
    positionX += manifest.indent.x;
    positionZ += manifest.indent.z;
    positionX *= -1;
    positionZ *= -1;

    let pointX = positionX + window.innerWidth / scale;
    let pointZ = positionZ + window.innerHeight / scale;

    const deltaX = pointX - positionX - size;
    if (deltaX < size) {
      const halfX = (size - deltaX) / 2;

      positionX -= halfX;
      pointX += halfX;
    }

    const deltaZ = pointZ - positionZ - size;
    if (deltaZ < size) {
      const halfZ = (size - deltaZ) / 2;

      positionZ -= halfZ;
      pointZ += halfZ;
    }

    const layerFilter = (y: number, x: number, z: number): boolean => {
      const size = TILE_SIZE * Math.pow(2, y);

      const startX = x * size;
      const startZ = z * size;
      const endX = startX + size;
      const endZ = startZ + size;

      return (
        (positionX <= startX &&
          startX <= pointX &&
          positionZ <= startZ &&
          startZ <= pointZ) ||
        (positionX <= startX &&
          startX <= pointX &&
          positionZ <= endZ &&
          endZ <= pointZ) ||
        (positionX <= endX &&
          endX <= pointX &&
          positionZ <= startZ &&
          startZ <= pointZ) ||
        (positionX <= endX &&
          endX <= pointX &&
          positionZ <= endZ &&
          endZ <= pointZ)
      );
    };

    const newShownTiles: Tile[][] = manifest.tiles.map((layer, y) =>
      y === positionY
        ? layer.filter(([x, z]) => layerFilter(y, x, z))
        : shownTiles[y].length
        ? shownTiles[y].filter(([x, z]) => layerFilter(y, x, z))
        : []
    );

    setShownTiles(newShownTiles);
  };

  const deferredUpdate = (event: ReactZoomPanPinchRef): void => {
    const id = String(Math.random() * Date.now());

    localStorage.setItem("id", id);

    setTimeout(() => {
      const savedId = localStorage.getItem("id");
      if (id !== savedId) return;

      const { scale, positionX, positionY } = event.state;

      update(scale, positionX, positionY);
    }, 200);
  };

  return (
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
                src={`/tiles/${y}/${x},${z}.png`}
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
  );
}
