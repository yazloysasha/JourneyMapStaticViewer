import Map from "../components/Map";
import type { ReactNode } from "react";
import { IManifest } from "../shared/types";
import type { GetServerSideProps } from "next";
import { updateTiles } from "../services/TileManager";

export const getServerSideProps: GetServerSideProps = async () => {
  const manifest = await updateTiles();

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
