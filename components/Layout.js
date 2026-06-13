import Head from 'next/head';
import Header from './header';
import GamesBanner from './GamesBanner';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div className="bg-white dark:bg-gray-900 transition-colors w-full overflow-x-hidden">
            <Head>
                <link rel="icon" href="/images/ice-hockey-puck.svg" />
                <title>{title}</title>
            </Head>
            <div className="md:ml-40">
            <GamesBanner />
            </div>
            <Header />
            <div className="md:ml-40">
            <main className="min-h-screen dark:text-white overflow-x-hidden">
            { children }
            </main>
            <footer className="p-4 text-center dark:text-white">
                <h3>Hackey</h3>
            </footer>
            </div>
        </div>
    )
} 
