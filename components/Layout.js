import Head from 'next/head';
import Header from './header';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div className="">
            <Head>
                <link rel="icon" href="/images/ice-hockey-puck.svg" />
            </Head>
            <Header />
            {/* <main className={s.main}> */}
            <main  className="overflow-auto min-h-screen flex flex-col">
            { children }
            </main>
            <footer className="">
                <h3>Hackey</h3>
            </footer>
        </div>
    )
} 
