import { motion } from 'framer-motion';
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
          <div>

          </div>
    </div>
  )
}
