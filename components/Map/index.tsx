import {
  COLORS,
  TILE_SIZE,
  RECOMMENDED_TILES_COUNT,
} from "../../shared/consts";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
  ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import styles from "./styles.module.scss";
import { getRandomElement } from "../../shared/utils";
import type { IManifest, ITown, Tile } from "../../shared/types";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { convertWindowCoordinates, getWindowCoordinates } from "./utils";

export default function Map({
  manifest,
  towns,
}: {
  manifest: IManifest;
  towns: ITown[];
}): ReactNode {
  const ref = useRef<ReactZoomPanPinchContentRef>(null);

  const [shownTiles, setShownTiles] = useState<Tile[][]>(
    new Array(manifest.tiles.length).fill([])
  );
  const [shownCanvases, setShownCanvases] = useState<Tile[]>([]);

  const [coordinates, setCoordinates] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const updateCoordinates = (
    scale: number,
    positionX: number,
    positionZ: number
  ): void => {
    const { startPointX, startPointZ, endPointX, endPointZ } =
      getWindowCoordinates(scale, positionX, positionZ, manifest);

    const x = Math.round(startPointX + (endPointX - startPointX) / 2);
    const z = Math.round(startPointZ + (endPointZ - startPointZ) / 2);

    setCoordinates([x, z, scale]);
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

  const deferredUpdate = (ref: ReactZoomPanPinchRef): void => {
    const { scale, positionX, positionY } = ref.state;

    updateCoordinates(scale, positionX, positionY);

    const id = String(Math.random() * Date.now());

    localStorage.setItem("id", id);

    setTimeout(() => {
      const savedId = localStorage.getItem("id");
      if (id !== savedId) return;

      updateTiles(scale, positionX, positionY);
    }, 200);
  };

  useEffect(() => {
    const canvases: Tile[] = [];

    towns.forEach((town) => {
      town.chunks.forEach(([chunkX, chunkZ]) => {
        const x = Math.floor((chunkX * 16) / TILE_SIZE);
        const z = Math.floor((chunkZ * 16) / TILE_SIZE);

        const canvas = canvases.find(([x2, z2]) => x === x2 && z === z2);
        if (canvas) return;

        canvases.push([x, z]);
      });
    });

    setShownCanvases(canvases);

    const interval = setInterval(() => {
      setCoordinates((coordinates) => {
        const [x, z, scale] = coordinates;
        const data: { x?: number; z?: number; y?: number } = {};

        if (x) data.x = x;
        if (z) data.z = z;
        if (scale !== 0.5) data.y = scale;

        let params = String(new URLSearchParams(data as never));
        if (params) params = "?" + params;

        history.replaceState(null, "", window.location.pathname + params);

        return coordinates;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!shownCanvases.length) return;

    towns.forEach((town) => {
      const color = getRandomElement(COLORS);

      town.chunks.forEach(([chunkX, chunkZ]) => {
        const tileX = Math.floor((chunkX * 16) / TILE_SIZE);
        const tileZ = Math.floor((chunkZ * 16) / TILE_SIZE);

        const id = `${tileX},${tileZ}`;

        const canvasElement = document.getElementById(id) as HTMLCanvasElement;
        const ctx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

        ctx.fillStyle = `rgba(${color}, 0.3)`;

        ctx.fillRect(
          (chunkX % (TILE_SIZE / 16)) * 16,
          (chunkZ % (TILE_SIZE / 16)) * 16,
          16,
          16
        );

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgb(${color})`;

        for (const [indentX, indentZ] of [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ]) {
          const anotherX = chunkX + indentX;
          const anotherZ = chunkZ + indentZ;

          const chunk = town.chunks.find(
            ([otherX, otherZ]) => otherX === anotherX && otherZ === anotherZ
          );

          if (chunk) continue;

          ctx.beginPath();

          ctx.moveTo(
            ((chunkX + Math.max(indentX, 0)) % (TILE_SIZE / 16)) * 16,
            ((chunkZ + Math.max(indentZ, 0)) % (TILE_SIZE / 16)) * 16
          );
          ctx.lineTo(
            (((chunkX + Math.min(indentX, 0)) % (TILE_SIZE / 16)) + 1) * 16,
            (((chunkZ + Math.min(indentZ, 0)) % (TILE_SIZE / 16)) + 1) * 16
          );

          ctx.stroke();
        }
      });
    });
  }, [shownCanvases]);

  let initialPositionX = 0;
  let initialPositionZ = 0;
  let initialScale = 0.5;

  if (typeof window !== "undefined") {
    const search = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );

    if (search.x) {
      const x = Number(search.x);
      if (!isNaN(x) && Number.isInteger(x)) {
        initialPositionX = x;
      }
    }

    if (search.z) {
      const z = Number(search.z);
      if (!isNaN(z) && Number.isInteger(z)) {
        initialPositionZ = z;
      }
    }

    if (search.y) {
      const y = Number(search.y);
      if (!isNaN(y) && 0.015 <= y && y <= 2) {
        initialScale = y;
      }
    }

    [initialPositionX, initialPositionZ] = convertWindowCoordinates(
      initialScale,
      initialPositionX,
      initialPositionZ,
      manifest
    );
  }

  return (
    <>
      <TransformWrapper
        initialScale={initialScale}
        minScale={0.015}
        maxScale={2}
        initialPositionX={initialPositionX}
        initialPositionY={initialPositionZ}
        wheel={{ smoothStep: 0.0006 }}
        onZoom={deferredUpdate}
        onPanning={deferredUpdate}
        onInit={deferredUpdate}
        ref={ref}
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

            {shownCanvases.map(([x, z]) => (
              <canvas
                id={`${x},${z}`}
                key={`${x},${z}`}
                width={TILE_SIZE + 4}
                height={TILE_SIZE + 4}
                style={{
                  left: manifest.indent.x + x * TILE_SIZE + 2,
                  top: manifest.indent.z + z * TILE_SIZE + 2,
                  zIndex: 10,
                }}
              />
            ))}
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
