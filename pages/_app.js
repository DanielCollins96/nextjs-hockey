import Head from "next/head";
import {QueryClient, QueryClientProvider} from "react-query";
import {Hydrate} from "react-query/hydration";
import {ReactQueryDevtools} from "react-query/devtools";
import {AuthProvider} from "../contexts/Auth";
import Layout from "../components/Layout";
import Script from "next/script";
import {Toaster} from "react-hot-toast";

import "../styles/globals.css";

import {Amplify} from "aws-amplify";
import config from "../aws-exports.js";
Amplify.configure({
  ...config,
  ssr: true,
});

const queryClient = new QueryClient();

function MyApp({Component, pageProps}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <AuthProvider>
          <Head>
            <title>NHL Scores and Stats | hockeydb.xyz</title>
            <meta title="NHL Scores and Stats | hockeydb.xyz" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta
              name="description"
              content="hockeydb.xyz provides statistics for National Hockey League Teams and Players"
            />
            <meta name="theme-color" content="#319795"></meta>
          </Head>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=G-LP1YV83204`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-LP1YV83204');
              `}
          </Script>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Toaster />
        </AuthProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
