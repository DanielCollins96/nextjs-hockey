import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { ReactQueryDevtools } from 'react-query/devtools'
import { AuthProvider } from '../contexts/Auth';
import { ToastProvider } from 'react-toast-notifications';
import Layout from '../components/Layout';
import Script from 'next/script';

import '../styles/globals.css'

import Amplify from 'aws-amplify';
import config from '../aws-exports.js';
Amplify.configure({
  ...config, ssr: true
});

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <AuthProvider>
          <ToastProvider>
            <Head>
            <meta title="Hockey Stats" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="National Hockey League Statistics" />
            <meta name="theme-color" content="#319795"></meta>
            </Head>
              <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-1QC1B66EW7`}
        />
            <Script id="" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-1QC1B66EW7');
              `}
            </Script>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
