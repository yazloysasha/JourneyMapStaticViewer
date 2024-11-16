import Map from "../components/Map";
import type { ReactNode } from "react";
import type { GetStaticProps } from "next";
import { IManifest } from "../shared/types";
import { getManifestOrUpdateTiles } from "../services/TileManager";

export const getStaticProps: GetStaticProps = async () => {
  const manifest = await getManifestOrUpdateTiles();

  return {
    props: {
      manifest,
    },
  };
};

export default function Index({
  manifest,
}: {
  manifest: IManifest;
}): ReactNode {
  return <Map manifest={manifest} />;
}
