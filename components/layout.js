import Head from 'next/head';
import Header from './header';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div>
            <Head>
                <title>Hockey</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            { children }
        </div>
    )
} 