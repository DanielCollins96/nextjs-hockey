import Head from 'next/head';
import Header from './header';
import s from './layout.module.css';
// import styles from '../styles/Home.module.css'


export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div lassName={s.container}>
            <Head>
                <title>Hockey</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className={s.main}>
            { children }
            </main>
            <footer className={s.footer}>
                <h3>Get Bent</h3>
            </footer>
        </div>
    )
} 