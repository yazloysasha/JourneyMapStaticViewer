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
      Math.min(8, Math.max(1, Math.round(Math.sqrt(1 / scale)))) - 1;

    positionX /= scale;
    positionZ /= scale;
    positionX += manifest.indent.x;
    positionZ += manifest.indent.z;
    positionX *= -1;
    positionZ *= -1;

    let rightX = positionX + window.innerWidth / scale;
    let bottomZ = positionZ + window.innerHeight / scale;

    const newShownTiles: Tile[][] = manifest.tiles.map((layer, y) =>
      y === positionY
        ? layer.filter(([x, z]) => {
            const size = (y + 1) * TILE_SIZE;

            const startX = x * size;
            const startZ = z * size;
            const endX = startX + size;
            const endZ = startZ + size;

            return (
              ((positionX <= startX && startX <= rightX) ||
                (positionX <= endX && endX <= rightX)) &&
              ((positionZ <= startZ && startZ < bottomZ) ||
                (positionZ < endZ && endZ <= bottomZ))
            );
          })
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
    }, 100);
  };

  return (
    <TransformWrapper
      initialScale={0.5}
      minScale={0.045}
      maxScale={2}
      centerOnInit
      onZoom={deferredUpdate}
      onPanning={deferredUpdate}
      onInit={deferredUpdate}
    >
      <TransformComponent>
        <div className={styles.map} style={manifest.sizes}>
          {shownTiles.map((layer, y) => {
            const scale = y + 1;
            const size = scale * TILE_SIZE;

            return layer.map(([x, z]) => (
              <Image
                key={`${y},${x},${z}`}
                src={`/tiles/${y}/${x},${z}.png`}
                alt={`${x}, ${z}`}
                width={size}
                height={size}
                style={{
                  left: manifest.indent.x + x * size - x * scale * 2,
                  top: manifest.indent.z + z * size - z * scale * 2,
                }}
              />
            ));
          })}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
