import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import styles from '../styles/Home.module.css';
// import Puck from '../public/ice-hockey-puck.svg';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* <img src="/planet-3.svg" alt="Planet" /> */}
          <motion.img 
            src="/ice-hockey-puck.svg" 
            alt="Puck" 
            width="200" 
            height="200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .1 }}
            whileTap={{ scale: 0.9 }}
            drag={true}
          />
        </div>
        <div>
          
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
