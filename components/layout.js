import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import Header from './header';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div className="">
            <Head>
                <title>Hockey</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            {/* <main className={s.main}> */}
            <Box as="main" bg='gray.100' h="100vh">
            { children }
            </Box>
            <footer className="">
                <h3>Get Bent</h3>
            </footer>
        </div>
    )
} 