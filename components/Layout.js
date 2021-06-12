import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import Header from './header';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div className="bg-gray-100">
            <Head>
                <title>Hockey</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            {/* <main className={s.main}> */}
            <main  className="h-screen grid place-items-center">
            { children }
            </main>
            <footer className="">
                <h3>Get Bent</h3>
            </footer>
        </div>
    )
} 