import Image from "next/image";
import styles from "./styles.module.scss";
import { TILE_SIZE } from "../../shared/consts";
import type { IManifest, Tile } from "../../shared/types";
import { useState, useEffect, type ReactNode } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function Map({ manifest }: { manifest: IManifest }): ReactNode {
  const [shownTiles, setShownTiles] = useState<Tile[][]>([]);

  useEffect(() => {
    const tiles: Tile[][] = [[]];

    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        tiles[0].push([x, z]);
      }
    }

    setShownTiles(tiles);
  }, []);

  return (
    <TransformWrapper
      initialScale={0.5}
      minScale={0.015}
      maxScale={2}
      centerOnInit
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
                  left: manifest.indent.x + x * size - x * y,
                  top: manifest.indent.z + z * size - z * y,
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
