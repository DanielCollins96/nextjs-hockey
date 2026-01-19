import Head from "next/head";
import {useState, useEffect} from "react";
import {useRouter} from "next/router";
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

function LoadingBar({isLoading}) {
  if (!isLoading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
      <div className="h-full bg-blue-500 animate-loading-bar" />
    </div>
  );
}

function MyApp({Component, pageProps}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

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
          <LoadingBar isLoading={isLoading} />
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
