import Image from "next/image";
import styles from "./styles.module.scss";
import type { IManifest, ITile } from "../../shared/types";
import { useState, useEffect, type ReactNode } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function Map({ manifest }: { manifest: IManifest }): ReactNode {
  const [shownTiles, setShownTiles] = useState<ITile[]>([]);

  useEffect(() => {
    const tiles: ITile[] = [];

    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        tiles.push({ y: 1, x, z });
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
          {shownTiles.map(({ y, x, z }, key) => (
            <Image
              key={key}
              src={`/tiles/${y}/${x},${z}.png`}
              alt={`${x}, ${z}`}
              width={y * manifest.tileSize}
              height={y * manifest.tileSize}
              style={{
                left: manifest.indent.x + y * x * manifest.tileSize - x * y,
                top: manifest.indent.z + y * z * manifest.tileSize - z * y,
                transform: `scale(${y})`,
              }}
            />
          ))}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
