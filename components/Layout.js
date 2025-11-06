import Head from 'next/head';
import Header from './header';

export default function Layout ({children, title = 'Hockey Stats'}) {
    return (
        <div className="bg-white dark:bg-gray-900 transition-colors">
            <Head>
                <link rel="icon" href="/images/ice-hockey-puck.svg" />
                <title>{title}</title>
            </Head>
            <Header />
            <main className="overflow-auto min-h-screen flex flex-col dark:text-white">
            { children }
            </main>
            <footer className="p-4 text-center dark:text-white">
                <h3>Hackey</h3>
            </footer>
        </div>
    )
} 
