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
