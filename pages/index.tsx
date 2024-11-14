import fs from "fs";
import Map from "../components/Map";
import type { ReactNode } from "react";
import { getConfig } from "../shared/utils";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  /**
   * Temporary solution !!!
   */
  if (!fs.existsSync("./public/tiles")) {
    const config = getConfig();

    fs.cpSync(config.TILES_PATH, "./public/tiles", { recursive: true });
  }

  return { props: {} };
};

export default function Index(): ReactNode {
  return <Map />;
}
