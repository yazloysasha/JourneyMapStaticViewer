import Image from "next/image";
import styles from "./styles.module.scss";
import { TILE_SIZE } from "../../shared/consts";
import type { IManifest, ITile } from "../../shared/types";
import { useState, useEffect, type ReactNode } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function Map({ manifest }: { manifest: IManifest }): ReactNode {
  const [shownTiles, setShownTiles] = useState<{ [y: number]: ITile[] }>({});

  useEffect(() => {
    const tiles: { [y: number]: ITile[] } = { 1: [] };

    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        tiles[1].push({ x, z });
      }
    }

    setShownTiles(tiles);
  }, []);

  const layers = Object.keys(shownTiles).map(Number);

  return (
    <TransformWrapper
      initialScale={0.5}
      minScale={0.015}
      maxScale={2}
      centerOnInit
    >
      <TransformComponent>
        <div className={styles.map} style={manifest.sizes}>
          {layers.map((y) =>
            shownTiles[y].map(({ x, z }) => (
              <Image
                key={`${y},${x},${z}`}
                src={`/tiles/${y}/${x},${z}.png`}
                alt={`${x}, ${z}`}
                width={y * TILE_SIZE}
                height={y * TILE_SIZE}
                style={{
                  left: manifest.indent.x + y * x * TILE_SIZE - x * y,
                  top: manifest.indent.z + y * z * TILE_SIZE - z * y,
                  transform: `scale(${y})`,
                }}
              />
            ))
          )}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
