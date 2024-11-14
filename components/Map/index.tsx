import Image from "next/image";
import type { ITile } from "./types";
import { getMapSizes } from "./utils";
import styles from "./styles.module.scss";
import { useState, useEffect, type ReactNode } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function Map(): ReactNode {
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

  const { sizes, indent } = getMapSizes(shownTiles);

  return (
    <TransformWrapper
      initialScale={0.5}
      minScale={0.025}
      maxScale={2}
      centerOnInit
    >
      <TransformComponent>
        <div className={styles.map} style={sizes}>
          {shownTiles.map(({ y, x, z }, key) => (
            <Image
              key={key}
              src={`/tiles/${y}/${x},${z}.png`}
              alt={`${x}, ${z}`}
              width={y * 512}
              height={y * 512}
              style={{
                left: indent.x + y * x * 512 - x * y,
                top: indent.z + y * z * 512 - z * y,
                transform: `scale(${y})`,
              }}
            />
          ))}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
