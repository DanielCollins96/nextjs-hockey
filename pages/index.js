import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import styles from '../styles/Home.module.css';
// import Puck from '../public/ice-hockey-puck.svg';

export default function Home() {
  return (
    <div >
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
  )
}
