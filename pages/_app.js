import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { ReactQueryDevtools } from 'react-query/devtools'
import { AuthProvider } from '../contexts/Auth';
import { ChakraProvider } from "@chakra-ui/react"
import Layout from '../components/Layout';

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
          <ChakraProvider>
            <Head>
            <meta title="Hockey Stats" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="National Hockey League Statistics" />
            <meta name="theme-color" content="#319795"></meta>
            </Head>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ChakraProvider>
        </AuthProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
