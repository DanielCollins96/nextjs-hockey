import Head from 'next/head';
import Header from './header';
// import styles from '../styles/Home.module.css'


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