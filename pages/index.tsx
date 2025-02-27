import Map from "../components/Map";
import type { ReactNode } from "react";
import type { GetStaticProps } from "next";
import { IManifest, ITown } from "../shared/types";
import { getTowns } from "../services/TownyManager";
import { getManifestOrUpdateTiles } from "../services/TileManager";

export const getStaticProps: GetStaticProps = async () => {
  const manifest = await getManifestOrUpdateTiles();

  const towns = getTowns();

  return {
    props: {
      manifest,
      towns,
    },
    revalidate: 300,
  };
};

export default function Index({
  manifest,
  towns,
}: {
  manifest: IManifest;
  towns: ITown[];
}): ReactNode {
  return <Map manifest={manifest} towns={towns} />;
}
