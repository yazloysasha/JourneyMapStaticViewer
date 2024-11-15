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
  const [shownTiles, setShownTiles] = useState<Tile[][]>([]);

  const update = (
    scale: number,
    positionX: number,
    positionZ: number
  ): void => {
    positionX /= scale;
    positionZ /= scale;
    positionX += manifest.indent.x;
    positionZ += manifest.indent.z;
    positionX *= -1;
    positionZ *= -1;

    let rightX = positionX + window.innerWidth / scale;
    let bottomZ = positionZ + window.innerHeight / scale;

    const indent = TILE_SIZE / scale;

    positionX -= indent;
    positionZ -= indent;
    rightX += indent;
    bottomZ += indent;

    const newShownTiles: Tile[][] = manifest.tiles
      .filter((_, y) => y === 0)
      .map((layer, y) => {
        const size = (y + 1) * TILE_SIZE;

        return layer.filter(([x, z]) => {
          const startX = x * size;
          const startZ = z * size;
          const endX = startX + size;
          const endZ = startZ + size;

          return (
            positionX <= startX &&
            startX < rightX &&
            positionX < endX &&
            endX <= rightX &&
            positionZ <= startZ &&
            startZ < bottomZ &&
            positionZ < endZ &&
            endZ <= bottomZ
          );
        });
      });

    setShownTiles(newShownTiles);
  };

  const deferredUpdate = (event: ReactZoomPanPinchRef): void => {
    const uuid = crypto.randomUUID();

    localStorage.setItem("uuid", uuid);

    setTimeout(() => {
      const savedUuid = localStorage.getItem("uuid");
      if (uuid !== savedUuid) return;

      const { scale, positionX, positionY } = event.state;

      update(scale, positionX, positionY);
    }, 100);
  };

  return (
    <TransformWrapper
      initialScale={0.5}
      minScale={0.015}
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
                  left: manifest.indent.x + x * size,
                  top: manifest.indent.z + z * size,
                  transform: `scale(${scale})`,
                }}
              />
            ));
          })}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
