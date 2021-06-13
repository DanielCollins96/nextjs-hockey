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
            <main  className="min-h-screen flex flex-col px-3 sm:px-8">
            { children }
            </main>
            <footer className="">
                <h3>Get Bent</h3>
            </footer>
        </div>
    )
} 