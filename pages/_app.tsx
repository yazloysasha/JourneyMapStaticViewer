import Head from "next/head";
import type { ReactNode } from "react";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";

import "../shared/styles/base.css";

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <>
      <Head>
        <link rel="icon" href="favicon.ico" type="image/x-icon" />

        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,maximum-scale=1,initial-scale=1,user-scalable=no,viewport-fit=cover"
        />
      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
